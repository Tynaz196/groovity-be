import { AuthenticationError, CustomError } from "@/errors/index.js";
import {
    CreateSongDto,
    GetSongDto,
    GetSongsDto,
    SongDto
} from "@/types/dto/song.dto.js";
import { StatusCodes } from "http-status-codes";
import { storageService } from "./storage.service.js";
import { musicsBucketConfigs } from "@/configs/storage.config.js";
import { songLikeRepo, songRepo, userRepo } from "@/repositories/index.js";
import sharp from "sharp";
import { envConfig } from "@/configs/env.config.js";
import { songModelToDto } from "@/utils/modelToDto.js";
import stableStringify from "json-stable-stringify";
import { cacheOrFetch } from "@/utils/caching.js";
import { namespaces } from "@/configs/redis.config.js";
import { redisService } from "./index.js";
import { Prisma } from "@prisma/client";
interface SongServiceInterface {
    createSong: (
        data: CreateSongDto,
        userId: string,
        audioFile: Express.Multer.File,
        coverImg: Express.Multer.File
    ) => Promise<SongDto>;
    getSong: (args: GetSongDto) => Promise<SongDto>;

    getSongs: (args: GetSongsDto) => Promise<SongDto[]>;

    getSongSignedAudioUrl: (id: string) => Promise<string | null>;

    likeSong: (userId: string, songId: string) => Promise<void>;

    unlikeSong: (userId: string, songId: string) => Promise<void>;

    getLikeStatus: (userId: string, songId: string) => Promise<boolean>;
}

export const songService: SongServiceInterface = {
    createSong: async (
        data: CreateSongDto,
        userId: string,
        audioFile: Express.Multer.File,
        coverImg: Express.Multer.File
    ): Promise<SongDto> => {
        //Format the image before uploading
        const coverImgBuffer = await sharp(coverImg.buffer)
            .resize(1024, 1024, {
                fit: "contain"
            })
            .png()
            .toBuffer();

        const { success, filePaths } = await storageService.uploadMany(
            musicsBucketConfigs.name,
            [
                {
                    folder: musicsBucketConfigs.audioFolder.name,
                    buffer: audioFile.buffer
                },
                {
                    folder: musicsBucketConfigs.coverFolder.name,
                    buffer: coverImgBuffer
                }
            ]
        );
        if (!success) {
            throw new CustomError(
                "Failed to upload files",
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
        const audioFilePath = filePaths[0];
        const coverImagePath = filePaths[1];
        try {
            const song = await songRepo.create({
                ...data,
                audioFilePath: audioFilePath,
                coverImagePath: coverImagePath,
                user: { connect: { id: userId } }
            });
            return songModelToDto(song);
        } catch (err) {
            await storageService.deleteMany(
                musicsBucketConfigs.name,
                filePaths
            );
            if (
                err instanceof Prisma.PrismaClientKnownRequestError &&
                err.code == "P2003"
            ) {
                throw new AuthenticationError(
                    "User not found",
                    StatusCodes.UNAUTHORIZED
                );
            }
            throw err;
        }
    },

    getSong: async (args: GetSongDto): Promise<SongDto> => {
        const { id, options } = args;
        const prismaOptions = {
            include: {
                user: {
                    include: {
                        ...options
                    }
                }
            }
        };
        const cacheKey = `${id}:${stableStringify(prismaOptions)}`;
        const { data: song, cacheHit } = await cacheOrFetch(
            namespaces.Song,
            cacheKey,
            () => songRepo.getOneByFilter({ id }, prismaOptions)
        );
        if (!cacheHit) {
            redisService.setAdd(
                {
                    namespace: namespaces.Song,
                    key: id,
                    members: [stableStringify(prismaOptions)!]
                },
                { EX: envConfig.REDIS_CACHING_EXP }
            );
            if (options.userProfile) {
                redisService.setAdd(
                    {
                        namespace: namespaces.Song,
                        key: `${id}:userProfile`,
                        members: [stableStringify(prismaOptions)!]
                    },
                    { EX: envConfig.REDIS_CACHING_EXP }
                );
            }
        }
        if (!song) {
            throw new CustomError("Song not found", StatusCodes.NOT_FOUND);
        }

        return songModelToDto(song);
    },

    getSongs: async (args: GetSongsDto): Promise<SongDto[]> => {
        const { options, name, userId } = args;
        const { limit, offset, userProfiles } = options;
        const songs = await songRepo.searchSongs(
            { name, userId },
            {
                take: limit,
                skip: offset,
                include: {
                    user: {
                        include: {
                            userProfile: userProfiles
                        }
                    }
                }
            }
        );

        // Use allSettled here for filter out successfully fetch result,
        // fail to fetch doesn't reject the promise.
        // If use Promise.all will caused the promise reject for only 1 fail result
        return (
            await Promise.allSettled(songs.map((song) => songModelToDto(song)))
        )
            .filter((result) => result.status == "fulfilled")
            .map((result) => result.value);
    },

    getSongSignedAudioUrl: async (id: string) => {
        const song = await songRepo.getOneByFilter({ id });
        if (!song) {
            throw new CustomError("Song not found", StatusCodes.NOT_FOUND);
        }
        const cacheKey = `${musicsBucketConfigs.name}:${musicsBucketConfigs.audioFolder}:${song.audioFilePath}`;
        const { data: audioUrl } = await cacheOrFetch(
            namespaces.Filepath,
            cacheKey,
            () =>
                storageService.generateUrl(
                    musicsBucketConfigs.name,
                    song.audioFilePath,
                    envConfig.MUCSIC_URL_EXP
                )
        );
        return audioUrl;
    },

    likeSong: async (userId: string, songId: string) => {
        const user = await userRepo.getOneByFilter({ id: userId });
        if (!user) {
            throw new AuthenticationError(
                "User not found",
                StatusCodes.UNAUTHORIZED
            );
        }
        const song = await songRepo.getOneByFilter({ id: songId });
        if (!song) {
            throw new CustomError("Song not found", StatusCodes.NOT_FOUND);
        }
        const { alreadyLiked } = await songLikeRepo.likeSong(userId, songId);

        (async () => {
            if (!alreadyLiked) {
                const affectedKeys = await redisService.getSetMembers({
                    namespace: namespaces.Like,
                    key: `songs:user:${userId}`
                });
                if (affectedKeys.length != 0) {
                    await redisService.delete({
                        namespace: namespaces.Like,
                        keys: [
                            ...affectedKeys.map(
                                (key) => `songs:user:${userId}:${key}`
                            )
                        ]
                    });
                }
                const date = new Date().toISOString().slice(0, 10);
                const key = `songs:dailyLikes:${date}`;

                const keyExisted = await redisService.isExist({
                    namespace: namespaces.Like,
                    key
                });

                await redisService.zSetIncrease({
                    namespace: namespaces.Like,
                    key,
                    member: songId,
                    value: 1
                });

                if (!keyExisted) {
                    await redisService.setExpire(
                        {
                            namespace: namespaces.Like,
                            key
                        },
                        7 * 24 * 60 * 60
                    );
                }
            }
        })();
    },

    unlikeSong: async (userId: string, songId: string) => {
        const user = await userRepo.getOneByFilter({ id: userId });
        if (!user) {
            throw new AuthenticationError(
                "User not found",
                StatusCodes.UNAUTHORIZED
            );
        }
        const song = await songRepo.getOneByFilter({ id: songId });
        if (!song) {
            throw new CustomError("Song not found", StatusCodes.NOT_FOUND);
        }
        const alreadyLiked = await songLikeRepo.unlikeSong(userId, songId);

        (async () => {
            if (alreadyLiked) {
                const affectedKeys = await redisService.getSetMembers({
                    namespace: namespaces.Like,
                    key: `songs:user:${userId}`
                });

                if (affectedKeys.length !== 0) {
                    await redisService.delete({
                        namespace: namespaces.Like,
                        keys: affectedKeys.map(
                            (key) => `songs:user:${userId}:${key}`
                        )
                    });
                }

                const date = new Date().toISOString().slice(0, 10);
                const key = `songs:dailyLikes:${date}`;

                const keyExisted = await redisService.isExist({
                    namespace: namespaces.Like,
                    key
                });

                if (!keyExisted) {
                    // Key doesn't exist — skip any decrement
                    return;
                }

                // Decrement the score
                const newScore = await redisService.zSetIncrease({
                    namespace: namespaces.Like,
                    key,
                    member: songId,
                    value: -1
                });
                // Remove member if score is 0 or below
                if (newScore <= 0) {
                    await redisService.zSetDeleteMember({
                        namespace: namespaces.Like,
                        key,
                        members: [songId]
                    });
                }
            }
        })();
    },

    getLikeStatus: async (userId: string, songId: string) => {
        const song = await songRepo.getOneByFilter({ id: songId });
        if (!song) {
            throw new CustomError("Song not found", StatusCodes.NOT_FOUND);
        }
        return !!(await songLikeRepo.getOneByFilter({ songId, userId }));
    }
};
