import { AuthenticationError, CustomError } from "@/errors/index.js";
import { albumLikeRepo, songLikeRepo, userRepo } from "@/repositories/index.js";
import { StatusCodes } from "http-status-codes";
import sharp from "sharp";
import { storageService } from "./storage.service.js";
import { usersBucketConfigs } from "@/configs/storage.config.js";
import {
    AlbumDto,
    GetUserLikedAlbumDto,
    GetUserLikedSongDto,
    GetUsersDto,
    SongDto,
    UpdateProfileDto,
    UserDto
} from "@/types/dto/index.js";
import {
    albumModelToDto,
    songModelToDto,
    userModelToDto
} from "@/utils/modelToDto.js";
import { cacheOrFetch } from "@/utils/caching.js";
import { namespaces } from "@/configs/redis.config.js";
import { redisService } from "./redis.service.js";
import { envConfig } from "@/configs/index.js";
import stableStringify from "json-stable-stringify";
import { Prisma } from "@prisma/client";

interface UserServiceInterface {
    updateAvatar: (
        userId: string,
        avatar: Express.Multer.File
    ) => Promise<void>;
    updateProfile: (userId: string, data: UpdateProfileDto) => Promise<UserDto>;
    getUser: (userId: string) => Promise<UserDto>;
    getUsers: (args: GetUsersDto) => Promise<UserDto[]>;
    getUserLikedSongs: (args: GetUserLikedSongDto) => Promise<SongDto[]>;
    getUserLikedAlbums: (args: GetUserLikedAlbumDto) => Promise<AlbumDto[]>;
}

export const userService: UserServiceInterface = {
    updateAvatar: async (userId: string, avatar: Express.Multer.File) => {
        const userProfile = await userRepo.getOneProfileByfilter({
            userId: userId
        });
        if (!userProfile) {
            throw new CustomError("User not found", StatusCodes.NOT_FOUND);
        }
        //Format the image before uploading
        const avatarBuffer = await sharp(avatar.buffer)
            .resize(512, 512, {
                fit: "contain"
            })
            .png()
            .toBuffer();

        const oldAvatarImagePath = userProfile.avatarImagePath;
        const avatarImagePath = await storageService.uploadOne(
            usersBucketConfigs.name,
            usersBucketConfigs.avatarFolder.name,
            avatarBuffer
        );

        try {
            await userRepo.updateProfile(
                { id: userProfile!.id },
                { avatarImagePath }
            );
        } catch (err) {
            await storageService.deleteOne(
                usersBucketConfigs.name,
                avatarImagePath
            );
            throw err;
        }
        if (oldAvatarImagePath) {
            await storageService.deleteOne(
                usersBucketConfigs.name,
                oldAvatarImagePath
            );
        }

        // Delete affected cache
        redisService
            .getSetMembers({
                namespace: namespaces.User,
                key: userId
            })
            .then((affectedKeys) => {
                if (affectedKeys.length != 0) {
                    redisService.delete({
                        namespace: namespaces.User,
                        keys: [...affectedKeys.map((key) => `${userId}:${key}`)]
                    });
                }
            });
    },

    updateProfile: async (userId: string, data: UpdateProfileDto) => {
        let updatedUser;
        try {
            updatedUser = await userRepo.update(
                { id: userId },
                {
                    userProfile: {
                        update: data
                    }
                },
                {
                    include: {
                        userProfile: true
                    }
                }
            );
        } catch (err) {
            if (
                err instanceof Prisma.PrismaClientKnownRequestError &&
                err.code === "P2025"
            ) {
                throw new CustomError("User not found", StatusCodes.NOT_FOUND);
            }
            throw err;
        }
        // Delete affected cache
        redisService
            .getSetMembers({
                namespace: namespaces.User,
                key: userId
            })
            .then((affectedKeys) => {
                if (affectedKeys.length != 0) {
                    redisService.delete({
                        namespace: namespaces.User,
                        keys: [...affectedKeys.map((key) => `${userId}:${key}`)]
                    });
                }
            });
        return userModelToDto(updatedUser);
    },

    getUser: async (userId: string) => {
        const prismaOptions = { include: { userProfile: true } };
        const cacheKey = `${userId}:${stableStringify(prismaOptions)}`;
        const { data: user, cacheHit } = await cacheOrFetch(
            namespaces.User,
            cacheKey,
            () => userRepo.getOneByFilter({ id: userId }, prismaOptions)
        );
        if (!cacheHit) {
            redisService.setAdd(
                {
                    namespace: namespaces.User,
                    key: userId,
                    members: [stableStringify(prismaOptions)!]
                },
                { EX: envConfig.REDIS_CACHING_EXP }
            );
        }
        if (!user) {
            throw new CustomError("User not found", StatusCodes.NOT_FOUND);
        }
        return userModelToDto(user);
    },

    getUsers: async (args: GetUsersDto): Promise<UserDto[]> => {
        const { options, name } = args;
        const { limit, offset } = options;
        const users = await userRepo.searchUsers(
            { name },
            {
                take: limit,
                skip: offset,
                include: {
                    userProfile: true
                }
            }
        );
        // Use allSettled here for filter out successfully fetch result,
        // fail to fetch doesn't reject the promise.
        // If use Promise.all will caused the promise reject for only 1 fail result
        return (
            await Promise.allSettled(users.map((user) => userModelToDto(user)))
        )
            .filter((result) => result.status == "fulfilled")
            .map((result) => result.value);
    },

    getUserLikedSongs: async (
        args: GetUserLikedSongDto
    ): Promise<SongDto[]> => {
        const { options, userId } = args;
        const { limit, offset, userProfiles } = options;
        const user = userRepo.getOneByFilter({ id: userId });
        if (!user) {
            throw new AuthenticationError(
                "User not found",
                StatusCodes.UNAUTHORIZED
            );
        }
        const prismaOptions: Omit<Prisma.SongLikeFindManyArgs, "where"> = {
            orderBy: {
                createdAt: Prisma.SortOrder.desc
            },
            include: {
                song: {
                    include: {
                        user: {
                            include: {
                                userProfile: userProfiles
                            }
                        }
                    }
                }
            },
            take: limit,
            skip: offset
        };
        const cacheKey = `songs:user:${userId}:${stableStringify(prismaOptions)}`;
        const { data: likes, cacheHit } = await cacheOrFetch(
            namespaces.Like,
            cacheKey,
            async () =>
                (await songLikeRepo.getManyByFilter(
                    { userId },
                    prismaOptions
                )) as Prisma.SongLikeGetPayload<{ include: { song: true } }>[]
        );

        if (!cacheHit) {
            redisService.setAdd(
                {
                    namespace: namespaces.Like,
                    key: `songs:user:${userId}`,
                    members: [stableStringify(prismaOptions)!]
                },
                { EX: envConfig.REDIS_CACHING_EXP }
            );
        }

        const songs = likes.map((like) => like.song);
        return (
            await Promise.allSettled(songs.map((song) => songModelToDto(song)))
        )
            .filter((result) => result.status == "fulfilled")
            .map((result) => result.value);
    },

    getUserLikedAlbums: async (
        args: GetUserLikedAlbumDto
    ): Promise<AlbumDto[]> => {
        const { options, userId } = args;
        const { limit, offset, userProfiles } = options;
        const user = userRepo.getOneByFilter({ id: userId });
        if (!user) {
            throw new AuthenticationError(
                "User not found",
                StatusCodes.UNAUTHORIZED
            );
        }
        const prismaOptions: Omit<Prisma.AlbumLikeFindManyArgs, "where"> = {
            orderBy: {
                createdAt: Prisma.SortOrder.desc
            },
            include: {
                album: {
                    include: {
                        user: {
                            include: {
                                userProfile: userProfiles
                            }
                        }
                    }
                }
            },
            take: limit,
            skip: offset
        };
        const cacheKey = `albums:user:${userId}:${stableStringify(prismaOptions)}`;
        const { data: likes, cacheHit } = await cacheOrFetch(
            namespaces.Like,
            cacheKey,
            async () =>
                (await albumLikeRepo.getManyByFilter(
                    { userId },
                    prismaOptions
                )) as Prisma.AlbumLikeGetPayload<{ include: { album: true } }>[]
        );

        if (!cacheHit) {
            redisService.setAdd(
                {
                    namespace: namespaces.Like,
                    key: `albums:user:${userId}`,
                    members: [stableStringify(prismaOptions)!]
                },
                { EX: envConfig.REDIS_CACHING_EXP }
            );
        }

        const albums = likes.map((like) => like.album);
        return (
            await Promise.allSettled(
                albums.map((album) => albumModelToDto(album))
            )
        )
            .filter((result) => result.status == "fulfilled")
            .map((result) => result.value);
    }
};
