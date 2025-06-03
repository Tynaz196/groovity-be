import {
    AuthenticationError,
    AuthorizationError,
    CustomError
} from "@/errors/index.js";
import {
    albumLikeRepo,
    albumRepo,
    songRepo,
    userRepo
} from "@/repositories/index.js";
import {
    AlbumDto,
    CreateAlbumDto,
    GetAlbumDto,
    GetAlbumsDto,
    UpdateAlbumDto
} from "@/types/dto/index.js";
import { Album, Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import sharp from "sharp";
import { storageService } from "./storage.service.js";
import { musicsBucketConfigs } from "@/configs/storage.config.js";
import { getDuplicates } from "@/utils/array.js";
import { albumModelToDto } from "@/utils/modelToDto.js";
import stableStringify from "json-stable-stringify";
import { cacheOrFetch } from "@/utils/caching.js";
import { namespaces } from "@/configs/redis.config.js";
import { redisService } from "./redis.service.js";
import { envConfig } from "@/configs/index.js";
interface AlbumServiceInterface {
    createAlbum: (
        data: CreateAlbumDto,
        userId: string,
        coverImg: Express.Multer.File
    ) => Promise<AlbumDto>;
    updateAlbum: (
        albumId: string,
        userId: string,
        data: UpdateAlbumDto
    ) => Promise<AlbumDto>;
    updateCoverImage: (
        albumId: string,
        userId: string,
        coverImg: Express.Multer.File
    ) => Promise<AlbumDto>;
    setSongs: (
        albumId: string,
        songIds: string[],
        userId: string
    ) => Promise<AlbumDto>;
    addSong: (
        albumId: string,
        songId: string,
        userId: string,
        index?: number
    ) => Promise<AlbumDto>;
    addSongs: (
        albumId: string,
        songIds: string[],
        userId: string
    ) => Promise<AlbumDto>;
    deleteSongs: (
        albumId: string,
        songIds: string[],
        userId: string
    ) => Promise<AlbumDto>;
    getAlbum: (args: GetAlbumDto) => Promise<AlbumDto>;
    getAlbums: (args: GetAlbumsDto) => Promise<AlbumDto[]>;
    publicAlbum: (albumId: string, userId: string) => Promise<void>;
    likeAlbum: (userId: string, albumId: string) => Promise<void>;
    unlikeAlbum: (userId: string, albumId: string) => Promise<void>;
    getLikeStatus: (userId: string, albumId: string) => Promise<boolean>;
}

export const albumService: AlbumServiceInterface = {
    createAlbum: async (
        data: CreateAlbumDto,
        userId: string,
        coverImg: Express.Multer.File
    ): Promise<AlbumDto> => {
        const coverImgBuffer = await sharp(coverImg.buffer)
            .resize(1024, 1024, {
                fit: "contain"
            })
            .png()
            .toBuffer();

        const coverImagePath = await storageService.uploadOne(
            musicsBucketConfigs.name,
            musicsBucketConfigs.coverFolder.name,
            coverImgBuffer
        );
        try {
            const album = await albumRepo.create({
                ...data,
                coverImagePath: coverImagePath,
                user: { connect: { id: userId } }
            });
            return albumModelToDto(album);
        } catch (err) {
            await storageService.deleteOne(
                musicsBucketConfigs.name,
                coverImagePath
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

    updateAlbum: async (
        albumId: string,
        userId: string,
        data: UpdateAlbumDto
    ) => {
        const album = await albumRepo.getOneByFilter({ id: albumId });
        if (!album) {
            throw new CustomError("Album not found", StatusCodes.NOT_FOUND);
        }
        if (album.userId != userId) {
            throw new AuthorizationError("Album not belong to user");
        }

        const updateAlbum = await albumModelToDto(
            await albumRepo.update({ id: albumId }, data)
        );

        // Delete affected cache
        redisService
            .getSetMembers({
                namespace: namespaces.Album,
                key: `${albumId}`
            })
            .then((affectedKeys) => {
                if (affectedKeys.length != 0) {
                    redisService.delete({
                        namespace: namespaces.Album,
                        keys: [
                            ...affectedKeys.map((key) => `${albumId}:${key}`)
                        ]
                    });
                }
            });
        return updateAlbum;
    },

    updateCoverImage: async (
        albumId: string,
        userId: string,
        coverImg: Express.Multer.File
    ) => {
        const album = await albumRepo.getOneByFilter({ id: albumId });
        if (!album) {
            throw new CustomError("Album not found", StatusCodes.NOT_FOUND);
        }
        if (album.userId != userId) {
            throw new AuthorizationError("Album not belong to user");
        }

        const coverImgBuffer = await sharp(coverImg.buffer)
            .resize(1024, 1024, {
                fit: "contain"
            })
            .png()
            .toBuffer();

        const oldCoverImagePath = album.coverImagePath;
        const coverImagePath = await storageService.uploadOne(
            musicsBucketConfigs.name,
            musicsBucketConfigs.coverFolder.name,
            coverImgBuffer
        );

        let updatedAlbum: Album;
        try {
            updatedAlbum = await albumRepo.update(
                { id: albumId },
                { coverImagePath }
            );
        } catch (err) {
            await storageService.deleteOne(
                musicsBucketConfigs.name,
                coverImagePath
            );
            throw err;
        }
        if (oldCoverImagePath) {
            await storageService.deleteOne(
                musicsBucketConfigs.name,
                oldCoverImagePath
            );
        }

        // Delete affected cache
        redisService
            .getSetMembers({
                namespace: namespaces.Album,
                key: albumId
            })
            .then((affectedKeys) => {
                if (affectedKeys.length != 0) {
                    redisService.delete({
                        namespace: namespaces.Album,
                        keys: [
                            ...affectedKeys.map((key) => `${albumId}:${key}`)
                        ]
                    });
                }
            });
        return albumModelToDto(updatedAlbum);
    },

    setSongs: async (
        albumId: string,
        songIds: string[],
        userId: string
    ): Promise<AlbumDto> => {
        const album = await albumRepo.getOneByFilter({ id: albumId });
        if (!album) {
            throw new CustomError("Album not found", StatusCodes.NOT_FOUND);
        }
        if (userId != album.userId) {
            throw new AuthorizationError("Album not belong to user");
        }
        const duplicatesIds = getDuplicates(songIds);
        if (duplicatesIds.length != 0) {
            throw new CustomError(
                "There are duplicate ids in the list",
                StatusCodes.BAD_REQUEST
            );
        }
        const songs = await songRepo.getManyByFilter(
            {
                id: {
                    in: songIds
                }
            },
            {
                select: {
                    id: true,
                    albumId: true,
                    userId: true
                }
            }
        );
        const notFoundSongIds = songIds.filter(
            (id) => !songs.map((song) => song.id).includes(id)
        );
        if (notFoundSongIds.length != 0) {
            throw new CustomError(
                `The following songs are not exist: ${notFoundSongIds}`,
                StatusCodes.NOT_FOUND
            );
        }
        const notBelongToUserSongs = songs.filter(
            (song) => song.userId != userId
        );
        if (notBelongToUserSongs.length != 0) {
            console.log(userId);
            throw new AuthorizationError(
                `The following songs are not belong to user: ${notBelongToUserSongs.map((song) => song.id)}`
            );
        }
        const assignedSongIds = songs
            .filter((song) => {
                return song.albumId != null && song.albumId != albumId;
            })
            .map((song) => song.id);
        if (assignedSongIds.length != 0) {
            throw new CustomError(
                `The following songs are already assigned to another album: ${assignedSongIds}`,
                StatusCodes.BAD_REQUEST
            );
        }

        const updatedAlbum = await albumRepo.connectSongs(albumId, songIds);

        // Delete affected cache
        redisService
            .getSetMembers({
                namespace: namespaces.Album,
                key: `${album.id}:songs`
            })
            .then((affectedKeys) => {
                if (affectedKeys.length != 0) {
                    redisService.delete({
                        namespace: namespaces.Album,
                        keys: [
                            ...affectedKeys.map((key) => `${albumId}:${key}`)
                        ]
                    });
                }
            });

        return albumModelToDto(updatedAlbum);
    },

    addSong: async (
        albumId: string,
        songId: string,
        userId: string,
        index?: number
    ): Promise<AlbumDto> => {
        const album = (await albumRepo.getOneByFilter(
            { id: albumId },
            {
                include: {
                    songs: {
                        orderBy: {
                            albumOrder: "asc"
                        }
                    }
                }
            }
        )) as Prisma.AlbumGetPayload<{
            include: { songs: true };
        }> | null;

        const song = await songRepo.getOneByFilter({ id: songId });
        if (!album) {
            throw new CustomError("Album not found", StatusCodes.NOT_FOUND);
        }
        if (userId != album.userId) {
            throw new AuthorizationError("Album not belong to user");
        }
        if (!song) {
            throw new CustomError("Song not found", StatusCodes.NOT_FOUND);
        }
        if (song.userId != userId) {
            throw new AuthorizationError("Song not belong to user");
        }
        if (song.albumId) {
            if (song.albumId == albumId) {
                throw new CustomError(
                    "The song is already existed in the album",
                    StatusCodes.CONFLICT
                );
            } else {
                throw new CustomError(
                    "The song is assigned to another album",
                    StatusCodes.CONFLICT
                );
            }
        }

        const result = await albumRepo.addSong(album, songId, index);

        // Delete affected cache
        redisService
            .getSetMembers({
                namespace: namespaces.Album,
                key: `${album.id}:songs`
            })
            .then((affectedKeys) => {
                if (affectedKeys.length != 0) {
                    redisService.delete({
                        namespace: namespaces.Album,
                        keys: [
                            ...affectedKeys.map((key) => `${albumId}:${key}`)
                        ]
                    });
                }
            });

        return albumModelToDto(result);
    },

    addSongs: async (albumId: string, songIds: string[], userId: string) => {
        const album = (await albumRepo.getOneByFilter(
            { id: albumId },
            {
                include: {
                    songs: {
                        orderBy: {
                            albumOrder: "asc"
                        }
                    }
                }
            }
        )) as Prisma.AlbumGetPayload<{
            include: { songs: true };
        }> | null;
        if (!album) {
            throw new CustomError("Album not found", StatusCodes.NOT_FOUND);
        }
        if (userId != album.userId) {
            throw new AuthorizationError("Album not belong to user");
        }
        const duplicatesIds = getDuplicates(songIds);
        if (duplicatesIds.length != 0) {
            throw new CustomError(
                "There are duplicate ids in the list",
                StatusCodes.BAD_REQUEST
            );
        }
        const songs = await songRepo.getManyByFilter(
            {
                id: {
                    in: songIds
                }
            },
            {
                select: {
                    id: true,
                    albumId: true,
                    userId: true
                }
            }
        );

        const notFoundSongIds = songIds.filter(
            (id) => !songs.map((song) => song.id).includes(id)
        );
        if (notFoundSongIds.length != 0) {
            throw new CustomError(
                `The following songs are not exist: ${notFoundSongIds}`,
                StatusCodes.NOT_FOUND
            );
        }
        const notBelongToUserSongs = songs.filter(
            (song) => song.userId != userId
        );
        if (notBelongToUserSongs.length != 0) {
            throw new AuthorizationError(
                `The following songs are not belong to user: ${notBelongToUserSongs.map((song) => song.id)}`
            );
        }
        const assginedSongIds = songs
            .filter((song) => {
                return song.albumId != null && song.albumId != albumId;
            })
            .map((song) => song.id);
        if (assginedSongIds.length != 0) {
            throw new CustomError(
                `The following songs are already assigned to another album: ${assginedSongIds}`,
                StatusCodes.BAD_REQUEST
            );
        }
        // songs that already in the album are ignored
        const unassignedSongIdSet = new Set(
            songs.filter((song) => !song.albumId).map((song) => song.id)
        );
        const unassignedSongIds = songIds.filter((id) =>
            unassignedSongIdSet.has(id)
        );

        const result = await albumRepo.addSongs(album, unassignedSongIds);

        redisService
            .getSetMembers({
                namespace: namespaces.Album,
                key: `${album.id}:songs`
            })
            .then((affectedKeys) => {
                if (affectedKeys.length != 0) {
                    redisService.delete({
                        namespace: namespaces.Album,
                        keys: [
                            ...affectedKeys.map((key) => `${albumId}:${key}`)
                        ]
                    });
                }
            });

        return albumModelToDto(result);
    },

    deleteSongs: async (albumId: string, songIds: string[], userId: string) => {
        const album = (await albumRepo.getOneByFilter(
            { id: albumId },
            {
                include: {
                    songs: {
                        orderBy: {
                            albumOrder: "asc"
                        }
                    }
                }
            }
        )) as Prisma.AlbumGetPayload<{
            include: { songs: true };
        }> | null;
        if (!album) {
            throw new CustomError("Album not found", StatusCodes.NOT_FOUND);
        }
        if (userId != album.userId) {
            throw new AuthorizationError("Album not belong to user");
        }
        const duplicatesIds = getDuplicates(songIds);
        if (duplicatesIds.length != 0) {
            throw new CustomError(
                "There are duplicate ids in the list",
                StatusCodes.BAD_REQUEST
            );
        }
        const notInAlbum = songIds.filter(
            (id) => !album.songs.some((song) => song.id === id)
        );

        if (notInAlbum.length > 0) {
            throw new CustomError(
                `The following song IDs are not in the album: ${notInAlbum.join(", ")}`,
                StatusCodes.BAD_REQUEST
            );
        }
        const updatedAlbum = await albumRepo.deleteSongs(album, songIds);

        // Delete affected cache
        redisService
            .getSetMembers({
                namespace: namespaces.Album,
                key: `${album.id}:songs`
            })
            .then((affectedKeys) => {
                if (affectedKeys.length != 0) {
                    redisService.delete({
                        namespace: namespaces.Album,
                        keys: [
                            ...affectedKeys.map((key) => `${albumId}:${key}`)
                        ]
                    });
                }
            });

        return albumModelToDto(updatedAlbum);
    },

    getAlbum: async (args: GetAlbumDto): Promise<AlbumDto> => {
        const { id, options, userId } = args;
        const prismaOptions = {
            include: {
                user: {
                    include: {
                        userProfile: options.userProfile
                    }
                },
                songs: options.songs
                    ? {
                          orderBy: {
                              albumOrder: Prisma.SortOrder.asc
                          }
                      }
                    : false
            }
        };
        const cacheKey = `${id}:${stableStringify(prismaOptions)}`;
        const { data: album, cacheHit } = await cacheOrFetch(
            namespaces.Album,
            cacheKey,
            () =>
                albumRepo.getOneByFilter(
                    {
                        id
                    },
                    prismaOptions
                )
        );

        if (!cacheHit) {
            redisService.setAdd(
                {
                    namespace: namespaces.Album,
                    key: id,
                    members: [stableStringify(prismaOptions)!]
                },
                { EX: envConfig.REDIS_CACHING_EXP }
            );
            if (options.songs) {
                redisService.setAdd(
                    {
                        namespace: namespaces.Album,
                        key: `${id}:songs`,
                        members: [stableStringify(prismaOptions)!]
                    },
                    { EX: envConfig.REDIS_CACHING_EXP }
                );
            }
            if (options.userProfile) {
                redisService.setAdd(
                    {
                        namespace: namespaces.Album,
                        key: `${id}:userProfile`,
                        members: [stableStringify(prismaOptions)!]
                    },
                    { EX: envConfig.REDIS_CACHING_EXP }
                );
            }
        }

        if (!album) {
            throw new CustomError("Album not found", StatusCodes.NOT_FOUND);
        }
        if (!album.isPublic && album.userId != userId) {
            throw new CustomError("Album not found", StatusCodes.NOT_FOUND);
        }
        return albumModelToDto(album);
    },

    getAlbums: async (args: GetAlbumsDto): Promise<AlbumDto[]> => {
        const { options, name, userId, loginUserId } = args;
        const { limit, offset } = options;
        const albums = await albumRepo.searchAlbums(
            { name, userId },
            {
                take: limit,
                skip: offset,
                include: {
                    user: {
                        include: {
                            userProfile: options.userProfiles
                        }
                    }
                }
            },
            loginUserId
        );

        // Use allSettled here for filter out successfully fetch result,
        // fail to fetch doesn't reject the promise.
        // If use Promise.all will caused the promise reject for only 1 fail result
        return (
            await Promise.allSettled(
                albums.map((album) => albumModelToDto(album))
            )
        )
            .filter((result) => result.status == "fulfilled")
            .map((result) => result.value);
    },

    publicAlbum: async (albumId: string, userId: string): Promise<void> => {
        const cacheKey = `${albumId}:${stableStringify({})}`;
        const { data: album } = await cacheOrFetch(
            namespaces.Album,
            cacheKey,
            () => albumRepo.getOneByFilter({ id: albumId })
        );
        if (!album) {
            throw new CustomError("Album not found", StatusCodes.NOT_FOUND);
        }
        if (userId != album.userId) {
            throw new AuthorizationError("Album not belong to user");
        }
        if (album.isPublic) {
            throw new CustomError(
                "Album is already public",
                StatusCodes.CONFLICT
            );
        }
        await albumRepo.update({ id: albumId }, { isPublic: true });
    },

    likeAlbum: async (userId: string, albumId: string) => {
        const user = await userRepo.getOneByFilter({ id: userId });
        if (!user) {
            throw new CustomError("User not found", StatusCodes.NOT_FOUND);
        }
        const album = await albumRepo.getOneByFilter({ id: albumId });
        if (!album) {
            throw new CustomError("Album not found", StatusCodes.NOT_FOUND);
        }
        await albumLikeRepo.likeAlbum(userId, albumId);

        redisService
            .getSetMembers({
                namespace: namespaces.Like,
                key: `albums:user:${userId}`
            })
            .then((affectedKeys) => {
                if (affectedKeys.length != 0) {
                    redisService.delete({
                        namespace: namespaces.Like,
                        keys: [
                            ...affectedKeys.map(
                                (key) => `albums:user:${userId}:${key}`
                            )
                        ]
                    });
                }
            });
    },

    unlikeAlbum: async (userId: string, albumId: string) => {
        const user = await userRepo.getOneByFilter({ id: userId });
        if (!user) {
            throw new CustomError("User not found", StatusCodes.NOT_FOUND);
        }
        const album = await albumRepo.getOneByFilter({ id: albumId });
        if (!album) {
            throw new CustomError("Album not found", StatusCodes.NOT_FOUND);
        }
        await albumLikeRepo.unlikeAlbum(userId, albumId);

        redisService
            .getSetMembers({
                namespace: namespaces.Like,
                key: `albums:user:${userId}`
            })
            .then((affectedKeys) => {
                if (affectedKeys.length != 0) {
                    redisService.delete({
                        namespace: namespaces.Like,
                        keys: [
                            ...affectedKeys.map(
                                (key) => `albums:user:${userId}:${key}`
                            )
                        ]
                    });
                }
            });
    },

    getLikeStatus: async (userId: string, albumId: string) => {
        const song = await albumRepo.getOneByFilter({ id: albumId });
        if (!song) {
            throw new CustomError("Album not found", StatusCodes.NOT_FOUND);
        }
        return !!(await albumLikeRepo.getOneByFilter({ albumId, userId }));
    }
};
