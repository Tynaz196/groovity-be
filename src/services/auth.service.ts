import { User } from "@prisma/client";
import { userRepo } from "@/repositories/index.js";
import { Prisma } from "@prisma/client";
import { AuthenticationError } from "@/errors/index.js";
import { StatusCodes } from "http-status-codes";
import { pickPropsFromObject } from "@/utils/object.js";
import { compareHash, generateHash } from "@/utils/bcrypt.js";
import { SignInDto, SignUpDto, UserDto } from "@/types/dto/index.js";
import { generateJwt } from "@/utils/jwt.js";
import { UserPayload } from "@/types/jwt.js";
import { randomInt } from "crypto";
import { sendMail } from "@/utils/mailer.js";
import { redisService } from "./redis.service.js";
import { timeToMs } from "@/utils/time.js";
import { envConfig } from "@/configs/env.config.js";
import { namespaces } from "@/configs/redis.config.js";
import { userModelToDto } from "@/utils/modelToDto.js";
interface AuthServiceInterface {
    signUp: (
        data: SignUpDto
    ) => Promise<{ user: UserDto; accessToken: string; refreshToken: string }>;
    signIn: (
        data: SignInDto
    ) => Promise<{ user: UserDto; accessToken: string; refreshToken: string }>;
    signOut: (refreshToken: string, accessToken?: string) => Promise<void>;
    refreshToken: (
        data: UserPayload,
        receivedRefreshToken: string
    ) => Promise<{ accessToken: string; refreshToken: string }>;
    sendVerification: (data: UserPayload) => Promise<string>;
    verifyCode: (userId: string, code: string) => Promise<void>;
}

export const authService: AuthServiceInterface = {
    signUp: async (data: SignUpDto) => {
        const { username, email, password, userProfile } = data;
        const filter: Prisma.UserWhereInput = {
            OR: [
                {
                    username: username
                },
                {
                    email: email
                }
            ]
        };
        const existedUser: User | null = await userRepo.getOneByFilter(filter);
        if (existedUser) {
            throw new AuthenticationError(
                "User is existed",
                StatusCodes.CONFLICT
            );
        }
        const user = await userRepo.create(
            {
                ...pickPropsFromObject(data, ["username", "email"]),
                password: await generateHash(password),
                userProfile: {
                    create: {
                        ...userProfile
                    }
                }
            },
            {
                include: {
                    userProfile: true
                }
            }
        );

        const verificationCode = randomInt(1000000).toString().padStart(6, "0");

        const mailOptions = {
            receiverEmail: user.email,
            subject: "Verification code",
            template: "verification",
            context: {
                name: user.username,
                verificationCode: verificationCode
            }
        };
        await redisService.set(
            {
                namespace: namespaces.Verification,
                key: user.id,
                value: await generateHash(verificationCode)
            },
            { EX: 900 }
        );
        sendMail(mailOptions);

        const payload: UserPayload = pickPropsFromObject(user, [
            "id",
            "isVerified"
        ]);
        const accessToken = generateJwt({ user: payload }, "at");
        const refreshToken = generateJwt({ user: payload }, "rt");
        await redisService.set(
            {
                namespace: namespaces.JWT_Refresh_Token,
                key: refreshToken,
                value: "authorized"
            },
            { EX: timeToMs(envConfig.JWT_REFRESH_EXP) / 1000 }
        );
        return { user: await userModelToDto(user), accessToken, refreshToken };
    },

    signIn: async (data: SignInDto) => {
        const { username, password } = data;
        const user = await userRepo.getOneByFilter({
            username: username
        });
        if (!user) {
            throw new AuthenticationError(
                "User not found",
                StatusCodes.NOT_FOUND
            );
        }
        if (!(await compareHash(password, user.password))) {
            throw new AuthenticationError(
                "Wrong password",
                StatusCodes.UNAUTHORIZED
            );
        }
        const payload: UserPayload = pickPropsFromObject(user, [
            "id",
            "isVerified"
        ]);
        const accessToken = generateJwt({ user: payload }, "at");
        const refreshToken = generateJwt({ user: payload }, "rt");
        await redisService.set(
            {
                namespace: namespaces.JWT_Refresh_Token,
                key: refreshToken,
                value: "authorized"
            },
            { EX: timeToMs(envConfig.JWT_REFRESH_EXP) / 1000 }
        );
        return { user: await userModelToDto(user), accessToken, refreshToken };
    },

    signOut: async (refreshToken: string, accessToken?: string) => {
        await redisService.delete({
            namespace: namespaces.JWT_Refresh_Token,
            keys: [refreshToken]
        });
        if (accessToken) {
            await redisService.set(
                {
                    namespace: namespaces.JWT_Token_Blacklist,
                    key: accessToken,
                    value: "revoked"
                },
                { EX: timeToMs(envConfig.JWT_ACCESS_EXP) / 1000 }
            );
        }
        return;
    },

    refreshToken: async (data: UserPayload, receivedRefreshToken: string) => {
        const { id } = data;
        const user = await userRepo.getOneByFilter({
            id: id
        });
        if (!user) {
            throw new AuthenticationError(
                "User not found",
                StatusCodes.NOT_FOUND
            );
        }
        const payload: UserPayload = pickPropsFromObject(user, [
            "id",
            "isVerified"
        ]);
        const accessToken = generateJwt({ user: payload }, "at");
        const refreshToken = generateJwt({ user: payload }, "rt");
        await redisService.set(
            {
                namespace: namespaces.JWT_Refresh_Token,
                key: refreshToken,
                value: "authorized"
            },
            { EX: timeToMs(envConfig.JWT_REFRESH_EXP) / 1000 }
        );
        await redisService.delete({
            namespace: namespaces.JWT_Refresh_Token,
            keys: [receivedRefreshToken]
        });
        return { accessToken, refreshToken };
    },

    sendVerification: async (data: UserPayload) => {
        const { id, isVerified } = data;
        const user = await userRepo.getOneByFilter({
            id: id
        });
        if (!user) {
            throw new AuthenticationError(
                "User not found",
                StatusCodes.NOT_FOUND
            );
        }
        if (isVerified) {
            throw new AuthenticationError(
                "User is already verified",
                StatusCodes.BAD_REQUEST
            );
        }
        const verificationCode = randomInt(1000000).toString().padStart(6, "0");
        const mailOptions = {
            receiverEmail: user.email,
            subject: "Verification code",
            template: "verification",
            context: {
                name: user.username,
                verificationCode: verificationCode
            }
        };
        await redisService.set(
            {
                namespace: namespaces.Verification,
                key: id,
                value: await generateHash(verificationCode)
            },
            { EX: 900 }
        );
        sendMail(mailOptions);
        return user.email;
    },

    verifyCode: async (userId: string, code: string) => {
        const user = await userRepo.getOneByFilter({ id: userId });
        if (!user) {
            throw new AuthenticationError(
                "User not found",
                StatusCodes.NOT_FOUND
            );
        }
        if (user.isVerified) {
            throw new AuthenticationError(
                "User is already verified",
                StatusCodes.BAD_REQUEST
            );
        }
        const storeHashedCode = await redisService.get({
            namespace: namespaces.Verification,
            key: userId
        });
        if (!storeHashedCode) {
            throw new AuthenticationError(
                "Verification code is not found or has expired",
                StatusCodes.BAD_REQUEST
            );
        }
        if (!(await compareHash(code, storeHashedCode))) {
            throw new AuthenticationError(
                "Wrong verification code",
                StatusCodes.BAD_REQUEST
            );
        }
        await userRepo.update({ id: user.id }, { isVerified: true });
    }
};
