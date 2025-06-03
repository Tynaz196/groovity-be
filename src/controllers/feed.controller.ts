import {
    getMostLikedSongsSchema,
    getRecentlyMostLikedSongSchema
} from "@/schemas/feed.schema.js";
import { feedService } from "@/services/feed.service.js";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

export const feedController = {
    getMostLikedSongs: async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const queries = req.query as z.infer<
                typeof getMostLikedSongsSchema
            >;
            const { limit = 10, offset = 0, userProfiles = false } = queries;

            const songs = await feedService.getMostLikedSong({
                options: { limit, offset, userProfiles }
            });

            res.status(StatusCodes.OK).json({
                status: "success",
                message: "Get most liked songs successfully",
                data: songs,
                count: songs.length
            });
        } catch (err) {
            next(err);
        }
    },

    getRecentlyLikedSongs: async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const queries = req.query as z.infer<
                typeof getRecentlyMostLikedSongSchema
            >;
            const { limit = 10, offset = 0, userProfiles = false } = queries;

            const songs = await feedService.getRecentlyLikedSongs({
                options: { limit, offset, userProfiles }
            });

            res.status(StatusCodes.OK).json({
                status: "success",
                message: "Get recently liked songs successfully",
                data: songs,
                count: songs.length
            });
        } catch (err) {
            next(err);
        }
    }
};
