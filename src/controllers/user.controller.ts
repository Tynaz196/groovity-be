import { CustomError } from "@/errors/CustomError.js";
import {
    getUserLikedAlbumsQuerySchema,
    getUserLikedSongsQuerySchema,
    getUsersQuerySchema,
    updateUserProfileSchema
} from "@/schemas/index.js";
import { userService } from "@/services/users.service.js";
import { omitPropsFromObject } from "@/utils/object.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

export const userController = {
    /* -------------------------------- Profiles -------------------------------- */
    updateAvatar: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user!;
            const file = req.file;
            if (!file) {
                throw new CustomError(
                    "Must upload an avatar image",
                    StatusCodes.BAD_REQUEST
                );
            }
            await userService.updateAvatar(user.id, file);
            res.status(StatusCodes.OK).json({
                status: "success",
                message: "Update avatar successfully"
            });
        } catch (err) {
            next(err);
        }
    },

    updateProfile: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user!;
            const bodyData = req.body as z.infer<
                typeof updateUserProfileSchema
            >;
            const birth = bodyData.birth ? new Date(bodyData.birth) : null;
            const updatedUser = await userService.updateProfile(user.id, {
                ...omitPropsFromObject(bodyData, "birth"),
                ...(birth ? { birth } : {})
            });
            res.status(StatusCodes.OK).json({
                status: "success",
                message: "Update profile successfully",
                data: {
                    user: updatedUser
                }
            });
        } catch (err) {
            next(err);
        }
    },

    getUser: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.params.id;
            console.log(userId);
            const user = await userService.getUser(userId);
            res.status(StatusCodes.OK).json({
                status: "success",
                message: "Get user successfully",
                data: {
                    user
                }
            });
        } catch (err) {
            next(err);
        }
    },

    getUsers: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const queries = req.query as z.infer<typeof getUsersQuerySchema>;
            const { limit = 10, offset = 0 } = queries;
            const users = await userService.getUsers({
                ...omitPropsFromObject(queries, ["limit", "offset"]),
                options: {
                    limit,
                    offset
                }
            });

            res.status(StatusCodes.OK).json({
                status: "success",
                message: "Get users successfully",
                data: users,
                count: users.length
            });
        } catch (err) {
            next(err);
        }
    },

    getLikedSongs: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user!;
            const queries = req.query as z.infer<
                typeof getUserLikedSongsQuerySchema
            >;
            const { limit = 10, offset = 0, userProfiles = false } = queries;
            const songs = await userService.getUserLikedSongs({
                userId: user.id,
                options: { limit, offset, userProfiles }
            });
            res.status(StatusCodes.OK).json({
                status: "success",
                message: "Get user liked song successfully",
                data: songs,
                count: songs.length
            });
        } catch (err) {
            next(err);
        }
    },

    getLikedAlbums: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user!;
            const queries = req.query as z.infer<
                typeof getUserLikedAlbumsQuerySchema
            >;
            const { limit = 10, offset = 0, userProfiles = false } = queries;
            const albums = await userService.getUserLikedAlbums({
                userId: user.id,
                options: { limit, offset, userProfiles }
            });
            res.status(StatusCodes.OK).json({
                status: "success",
                message: "Get user liked album successfully",
                data: albums,
                count: albums.length
            });
        } catch (err) {
            next(err);
        }
    }
};
