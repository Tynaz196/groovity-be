import { CustomError } from "@/errors/index.js";
import {
    addSongSchema,
    addSongsSchema,
    getAlbumQuerySchema,
    getAlbumsQuerySchema,
    setSongsSchema,
    createAlbumSchema,
    updateAlbumSchema,
    deleteSongsSchema
} from "@/schemas/index.js";
import { albumService } from "@/services/index.js";
import { omitPropsFromObject } from "@/utils/object.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

export const albumController = {
    createAlbum: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const bodyData = req.body as z.infer<typeof createAlbumSchema>;
            const user = req.user!;
            const file = req.file;
            if (!file) {
                throw new CustomError(
                    "Must upload a cover image",
                    StatusCodes.BAD_REQUEST
                );
            }
            const album = await albumService.createAlbum(
                bodyData,
                user.id,
                file
            );
            res.status(StatusCodes.CREATED).json({
                status: "success",
                message: "Album created successfully",
                data: {
                    album
                }
            });
        } catch (err) {
            next(err);
        }
    },

    updateAlbum: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user!;
            const albumId = req.params.id;
            const bodyData = req.body as z.infer<typeof updateAlbumSchema>;
            const album = await albumService.updateAlbum(
                albumId,
                user.id,
                bodyData
            );
            res.status(StatusCodes.OK).json({
                status: "success",
                message: "Updated album successfully",
                data: {
                    album
                }
            });
        } catch (err) {
            next(err);
        }
    },

    updateCoverImage: async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const albumId = req.params.id;
            const user = req.user!;
            const file = req.file;
            if (!file) {
                throw new CustomError(
                    "Must upload an image",
                    StatusCodes.BAD_REQUEST
                );
            }
            const album = await albumService.updateCoverImage(
                albumId,
                user.id,
                file
            );
            res.status(StatusCodes.OK).json({
                status: "success",
                message: "Updated album cover image successfully",
                data: {
                    album
                }
            });
        } catch (err) {
            next(err);
        }
    },

    setSongs: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const albumId = req.params.albumId;
            const songIds = req.body as z.infer<typeof setSongsSchema>;
            const user = req.user!;

            const album = await albumService.setSongs(
                albumId,
                songIds,
                user.id
            );

            res.status(StatusCodes.OK).json({
                status: "success",
                message: "Set songs for album successfully",
                data: {
                    album
                }
            });
        } catch (err) {
            next(err);
        }
    },

    addSong: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const albumId = req.params.albumId;
            const songId = req.params.songId;
            const bodyData = req.body as z.infer<typeof addSongSchema>;
            const user = req.user!;

            const album = await albumService.addSong(
                albumId,
                songId,
                user.id,
                bodyData.index
            );

            res.status(StatusCodes.OK).json({
                status: "success",
                message: "Add song to album successfully",
                data: {
                    album
                }
            });
        } catch (err) {
            next(err);
        }
    },

    addSongs: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const albumId = req.params.albumId;
            const songIds = req.body as z.infer<typeof addSongsSchema>;
            const user = req.user!;

            const album = await albumService.addSongs(
                albumId,
                songIds,
                user.id
            );

            res.status(StatusCodes.OK).json({
                status: "success",
                message: "Add songs to album successfully",
                data: {
                    album
                }
            });
        } catch (err) {
            next(err);
        }
    },

    deleteSongs: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const albumId = req.params.albumId;
            const songIds = req.body as z.infer<typeof deleteSongsSchema>;
            const user = req.user!;

            const album = await albumService.deleteSongs(
                albumId,
                songIds,
                user.id
            );

            res.status(StatusCodes.OK).json({
                status: "success",
                message: "Delete songs from album successfully",
                data: {
                    album
                }
            });
        } catch (err) {
            next(err);
        }
    },

    publicAlbum: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const albumId = req.params.id;
            const user = req.user!;

            await albumService.publicAlbum(albumId, user.id);

            res.status(StatusCodes.OK).json({
                status: "success",
                message: "Public album successfully"
            });
        } catch (err) {
            next(err);
        }
    },

    getAlbum: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const albumId = req.params.id;
            const queries = req.query as z.infer<typeof getAlbumQuerySchema>;
            const userId = req.user?.id;
            const { userProfile = false, songs = false } = queries;
            const album = await albumService.getAlbum({
                id: albumId,
                options: {
                    userProfile,
                    songs
                },
                userId
            });
            res.status(StatusCodes.OK).json({
                status: "success",
                data: {
                    album
                }
            });
        } catch (err) {
            next(err);
        }
    },

    getAlbums: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const queries = req.query as z.infer<typeof getAlbumsQuerySchema>;
            const loginUserId = req.user?.id;
            const { limit = 10, offset = 0, userProfiles = false } = queries;
            const albums = await albumService.getAlbums({
                ...omitPropsFromObject(queries, ["limit", "offset"]),
                options: {
                    limit,
                    offset,
                    userProfiles
                },
                loginUserId
            });
            res.status(StatusCodes.OK).json({
                status: "success",
                data: albums,
                count: albums.length
            });
        } catch (err) {
            next(err);
        }
    },

    likeAlbum: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user!;
            const albumId = req.params.id;
            await albumService.likeAlbum(user.id, albumId);
            res.status(StatusCodes.OK).json({
                status: "success",
                message: "Like album successfully"
            });
        } catch (err) {
            next(err);
        }
    },

    unlikeAlbum: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user!;
            const albumId = req.params.id;
            await albumService.unlikeAlbum(user.id, albumId);
            res.status(StatusCodes.OK).json({
                status: "success",
                message: "Unlike album successfully"
            });
        } catch (err) {
            next(err);
        }
    },
    getLikeStatus: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user!;
            const albumId = req.params.id;
            const likeStatus = await albumService.getLikeStatus(
                user.id,
                albumId
            );
            res.status(StatusCodes.OK).json({
                status: "success",
                message: "Get album like status successfully",
                data: {
                    likeStatus
                }
            });
        } catch (err) {
            next(err);
        }
    }
};
