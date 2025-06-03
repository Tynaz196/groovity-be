import { CustomError } from "@/errors/CustomError.js";
import {
    getSongQuerySchema,
    getSongsSchema,
    uploadSongSchema
} from "@/schemas/index.js";
import { songService } from "@/services/index.js";
import { omitPropsFromObject } from "@/utils/object.js";
import axios from "axios";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

export const songController = {
    uploadSong: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const bodyData = req.body as z.infer<typeof uploadSongSchema>;
            const user = req.user!;
            const files = req.files as {
                [fieldname: string]: Express.Multer.File[];
            };
            if (!files.audioFile) {
                throw new CustomError(
                    "Must upload a song",
                    StatusCodes.BAD_REQUEST
                );
            }
            if (!files.coverImage) {
                throw new CustomError(
                    "Must upload a cover image",
                    StatusCodes.BAD_REQUEST
                );
            }
            const audioFile = files.audioFile[0];
            const coverImage = files.coverImage[0];
            const song = await songService.createSong(
                bodyData,
                user.id,
                audioFile,
                coverImage
            );
            res.status(StatusCodes.CREATED).json({
                status: "success",
                message: "Song uploaded successfully",
                data: {
                    song
                }
            });
        } catch (err) {
            next(err);
        }
    },

    getSong: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const songId = req.params.id;
            const queries = req.query as z.infer<typeof getSongQuerySchema>;
            const { userProfile = false } = queries;
            const song = await songService.getSong({
                id: songId,
                options: {
                    userProfile
                }
            });
            res.status(StatusCodes.OK).json({
                status: "success",
                data: {
                    song
                }
            });
        } catch (err) {
            next(err);
        }
    },

    getSongs: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const queries = req.query as z.infer<typeof getSongsSchema>;
            const { limit = 10, offset = 0, userProfiles = false } = queries;
            const songs = await songService.getSongs({
                ...omitPropsFromObject(queries, ["limit", "offset"]),
                options: {
                    limit,
                    offset,
                    userProfiles
                }
            });
            res.status(StatusCodes.OK).json({
                status: "success",
                message: "Get songs successfully",
                data: songs,
                count: songs.length
            });
        } catch (err) {
            next(err);
        }
    },

    streamSong: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const songId = req.params.id;
            const audioUrl = await songService.getSongSignedAudioUrl(songId);
            const chunk_size = 500 * 1e3; //0.5MB chunk size
            const range = req.headers.range || "0";

            if (!audioUrl) {
                throw new CustomError(
                    "Unable fetching song",
                    StatusCodes.INTERNAL_SERVER_ERROR
                );
            }

            const audioResponse = await axios.head(audioUrl);
            const audioSize = parseInt(
                audioResponse.headers["content-length"],
                10
            );
            const start = Number(range.replace(/\D/g, ""));
            const end = Math.min(start + chunk_size - 1, audioSize - 1);
            const contentLength = end - start + 1;

            const audioStream = await axios({
                url: audioUrl,
                method: "GET",
                responseType: "stream",
                headers: {
                    Range: `bytes=${start}-${end}`
                }
            });
            const headers = {
                "Content-Range": `bytes ${start}-${end}/${audioSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": contentLength,
                "Content-Type": "audio/mpeg",
                "Transfer-Encoding": "chunked"
            };
            res.status(StatusCodes.PARTIAL_CONTENT).set(headers);
            audioStream.data.pipe(res);
        } catch (err) {
            next(err);
        }
    },

    likeSong: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user!;
            const songId = req.params.id;
            await songService.likeSong(user.id, songId);
            res.status(StatusCodes.OK).json({
                status: "success",
                message: "Like song successfully"
            });
        } catch (err) {
            next(err);
        }
    },

    unlikeSong: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user!;
            const songId = req.params.id;
            await songService.unlikeSong(user.id, songId);
            res.status(StatusCodes.OK).json({
                status: "success",
                message: "Unlike song successfully"
            });
        } catch (err) {
            next(err);
        }
    },
    getLikeStatus: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user!;
            const songId = req.params.id;
            const likeStatus = await songService.getLikeStatus(user.id, songId);
            res.status(StatusCodes.OK).json({
                status: "success",
                message: "Get song like status successfully",
                data: {
                    likeStatus
                }
            });
        } catch (err) {
            next(err);
        }
    }
};
