import { envConfig } from "@/configs/env.config.js";
import {
    signInSchema,
    signUpSchema,
    verifyCodeSchema
} from "@/schemas/index.js";
import { authService } from "@/services/index.js";
import { SignUpDto } from "@/types/dto/index.js";
import { omitPropsFromObject } from "@/utils/object.js";
import { timeToMs } from "@/utils/time.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

export const authController = {
    signIn: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const bodyData = req.body as z.infer<typeof signInSchema>;
            const { user, accessToken, refreshToken } =
                await authService.signIn(bodyData);
            res.status(StatusCodes.OK)
                .cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "strict",
                    path: "/",
                    maxAge: timeToMs(envConfig.JWT_REFRESH_EXP)
                })
                .json({
                    status: "success",
                    message: "User sign in successfully",
                    data: {
                        user,
                        accessToken,
                        refreshToken
                    }
                });
        } catch (err) {
            next(err);
        }
    },

    signUp: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const bodyData = req.body as z.infer<typeof signUpSchema>;
            const { userProfile } = bodyData;
            const birth = new Date(userProfile.birth);
            const signUpdata: SignUpDto = {
                ...omitPropsFromObject(bodyData, "userProfile"),
                userProfile: {
                    ...omitPropsFromObject(userProfile, "birth"),
                    birth
                }
            };
            const { user, accessToken, refreshToken } =
                await authService.signUp(signUpdata);
            res.status(StatusCodes.CREATED)
                .cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "strict",
                    path: "/",
                    maxAge: timeToMs(envConfig.JWT_REFRESH_EXP)
                })
                .json({
                    status: "success",
                    message: "User sign up successfully",
                    data: {
                        user,
                        accessToken,
                        refreshToken
                    }
                });
        } catch (err) {
            next(err);
        }
    },

    signOut: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.cookies.refreshToken as string;
            const accessToken = req.headers.authorization?.split(" ")[1];
            await authService.signOut(refreshToken, accessToken);
            res.status(StatusCodes.OK).clearCookie("refreshToken").json({
                status: "success",
                message: "Sign out successfully"
            });
        } catch (err) {
            next(err);
        }
    },

    refreshToken: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const payload = req.user!;
            const token = req.cookies.refreshToken;
            const { accessToken, refreshToken } =
                await authService.refreshToken(payload, token);
            res.status(StatusCodes.OK)
                .cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "strict",
                    path: "/",
                    maxAge: timeToMs(envConfig.JWT_REFRESH_EXP)
                })
                .json({
                    status: "success",
                    message: "Refresh access token successfully",
                    data: {
                        accessToken,
                        refreshToken
                    }
                });
        } catch (err) {
            next(err);
        }
    },

    sendVerification: async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const payload = req.user!;
            const email = await authService.sendVerification(payload);
            res.status(StatusCodes.OK).json({
                status: "success",
                message: `Sent verification to ${email}`
            });
        } catch (err) {
            next(err);
        }
    },

    verifyCode: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const payload = req.user!;
            const bodyData = req.body as z.infer<typeof verifyCodeSchema>;
            await authService.verifyCode(payload.id, bodyData.code);
            res.status(StatusCodes.OK).json({
                status: "success",
                message: "User is verified successfully"
            });
        } catch (err) {
            next(err);
        }
    }
};
