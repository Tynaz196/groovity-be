import { envConfig } from "@/configs/index.js";
import { AuthenticationError, CustomError } from "@/errors/index.js";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { redisService } from "@/services/index.js";
import { namespaces } from "@/configs/redis.config.js";
import { UserPayload } from "@/types/jwt.js";

type VerifyTokenMiddlewareOptions =
    | { type: "at"; required?: boolean }
    | { type: "rt" }
    | { type: "both"; accessTokenRequired?: boolean };
export const verifyTokenMiddleware = (
    options: VerifyTokenMiddlewareOptions
) => {
    const type = options.type;
    if (type == "at") {
        return verifyAccessToken(options.required);
    } else if (type == "rt") {
        return verifyRefreshToken();
    } else {
        return verifyBothToken(options.accessTokenRequired);
    }
};

const verifyAccessToken = (required: boolean = true) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Get the token
        const secret = envConfig.JWT_ACCESS_SECRET;
        if (!secret) {
            if (!required) {
                return next();
            }
            return next(
                new CustomError(
                    "JWT secret key is not found",
                    StatusCodes.INTERNAL_SERVER_ERROR
                )
            );
        }
        const authorization = req.headers.authorization;
        if (!authorization) {
            if (!required) {
                return next();
            }
            return next(
                new AuthenticationError(
                    "Missing authorization header",
                    StatusCodes.UNAUTHORIZED
                )
            );
        }
        const token = authorization.split(" ")[1];
        if (!token) {
            if (!required) {
                return next();
            }
            return next(
                new AuthenticationError(
                    "Missing access token",
                    StatusCodes.UNAUTHORIZED
                )
            );
        }
        if (
            await redisService.get({
                namespace: namespaces.JWT_Token_Blacklist,
                key: token
            })
        ) {
            if (!required) {
                return next();
            }
            return next(
                new AuthenticationError(
                    "Invalid access token",
                    StatusCodes.UNAUTHORIZED
                )
            );
        }
        // Validate the token
        try {
            const payload = jwt.verify(token, secret) as jwt.JwtPayload;
            req.user = payload.user;
            return next();
        } catch (err) {
            if (!required) {
                return next();
            }
            if (err instanceof jwt.JsonWebTokenError) {
                return next(
                    new AuthenticationError(
                        "Invalid access token",
                        StatusCodes.UNAUTHORIZED
                    )
                );
            } else {
                return next(err);
            }
        }
    };
};

const verifyRefreshToken = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Get the token
        const secret = envConfig.JWT_REFRESH_SECRET;
        const token = req.cookies.refreshToken;
        if (!token) {
            return next(
                new AuthenticationError(
                    "Missing refresh token",
                    StatusCodes.UNAUTHORIZED
                )
            );
        }
        if (
            !(await redisService.get({
                namespace: namespaces.JWT_Refresh_Token,
                key: token
            }))
        ) {
            return next(
                new AuthenticationError(
                    "Invalid refresh token",
                    StatusCodes.UNAUTHORIZED
                )
            );
        }
        // Validate the token
        try {
            if (!secret) {
                return next(
                    new CustomError(
                        "JWT secret key is not found",
                        StatusCodes.INTERNAL_SERVER_ERROR
                    )
                );
            }
            const payload = jwt.verify(token, secret) as jwt.JwtPayload;
            req.user = payload.user;
            return next();
        } catch (err) {
            if (err instanceof jwt.JsonWebTokenError) {
                return next(
                    new AuthenticationError(
                        "Invalid refresh token",
                        StatusCodes.UNAUTHORIZED
                    )
                );
            } else {
                return next(err);
            }
        }
    };
};

// use when sign out
const verifyBothToken = (accessTokenRequired: boolean = true) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Get the token
        const secret = envConfig.JWT_REFRESH_SECRET;
        if (!secret) {
            return next(
                new CustomError(
                    "JWT secret key is not found",
                    StatusCodes.INTERNAL_SERVER_ERROR
                )
            );
        }
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return next(
                new AuthenticationError(
                    "Missing refresh token",
                    StatusCodes.UNAUTHORIZED
                )
            );
        }
        if (
            !(await redisService.get({
                namespace: namespaces.JWT_Refresh_Token,
                key: refreshToken
            }))
        ) {
            console.log(refreshToken);
            return next(
                new AuthenticationError(
                    "Invalid refresh token",
                    StatusCodes.UNAUTHORIZED
                )
            );
        }
        // Validate the token
        let refreshTokenUserPayload: UserPayload;
        try {
            const payload = jwt.verify(refreshToken, secret) as jwt.JwtPayload;
            refreshTokenUserPayload = payload.user;
        } catch (err) {
            if (err instanceof jwt.JsonWebTokenError) {
                return next(
                    new AuthenticationError(
                        "Invalid refresh token",
                        StatusCodes.UNAUTHORIZED
                    )
                );
            } else {
                return next(err);
            }
        }

        const authorization = req.headers.authorization;
        if (!authorization) {
            if (!accessTokenRequired) {
                return next();
            }
            return next(
                new AuthenticationError(
                    "Missing authorization header",
                    StatusCodes.UNAUTHORIZED
                )
            );
        }
        const accessToken = authorization.split(" ")[1];
        if (!accessToken) {
            if (!accessTokenRequired) {
                return next();
            }
            return next(
                new AuthenticationError(
                    "Missing access token",
                    StatusCodes.UNAUTHORIZED
                )
            );
        }
        if (
            await redisService.get({
                namespace: namespaces.JWT_Token_Blacklist,
                key: accessToken
            })
        ) {
            if (!accessTokenRequired) {
                return next();
            }
            return next(
                new AuthenticationError(
                    "Invalid access token",
                    StatusCodes.UNAUTHORIZED
                )
            );
        }
        // Validate the access token
        let accessTokenUserPayload: UserPayload;
        try {
            const payload = jwt.verify(accessToken, secret) as jwt.JwtPayload;
            accessTokenUserPayload = payload.user;
            if (accessTokenUserPayload.id != refreshTokenUserPayload.id) {
                return next(
                    new AuthenticationError(
                        "Access token and refresh token mismatch",
                        StatusCodes.BAD_REQUEST
                    )
                );
            }
        } catch (err) {
            if (!accessTokenRequired) {
                req.user = refreshTokenUserPayload;
                return next();
            }
            if (err instanceof jwt.JsonWebTokenError) {
                return next(
                    new AuthenticationError(
                        "Invalid access token",
                        StatusCodes.UNAUTHORIZED
                    )
                );
            } else {
                return next(err);
            }
        }
    };
};

export const isVerifiedUserMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const user = req.user!;
    if (!user.isVerified) {
        return next(
            new AuthenticationError(
                "User is not verified",
                StatusCodes.UNAUTHORIZED
            )
        );
    }
    return next();
};
