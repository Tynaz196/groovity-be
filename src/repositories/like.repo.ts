import { Prisma } from "@prisma/client";
import prismaClient from "@/databases/prisma.js";

export const songLikeRepo = {
    create: (
        data: Prisma.SongLikeCreateInput,
        options?: Omit<Prisma.SongLikeCreateArgs, "data">
    ) => {
        return prismaClient.songLike.create({
            data: data,
            ...options
        });
    },

    getOneByFilter: (
        filter: Prisma.SongLikeWhereInput,
        options?: Omit<Prisma.SongLikeFindFirstArgs, "where">
    ) => {
        return prismaClient.songLike.findFirst({
            where: filter,
            ...options
        });
    },

    getManyByFilter: (
        filter: Prisma.SongLikeWhereInput,
        options?: Omit<Prisma.SongLikeFindManyArgs, "where">
    ) => {
        return prismaClient.songLike.findMany({
            where: filter,
            ...options
        });
    },

    delete: (
        filter: Prisma.SongLikeWhereUniqueInput,
        options?: Omit<Prisma.SongLikeDeleteArgs, "where">
    ) => {
        return prismaClient.songLike.delete({
            where: filter,
            ...options
        });
    },

    likeSong: (userId: string, songId: string) => {
        return prismaClient.$transaction(async (tx) => {
            const like = await tx.songLike.findFirst({
                where: { userId, songId }
            });
            if (!like) {
                await tx.song.update({
                    where: { id: songId },
                    data: {
                        likesCount: {
                            increment: 1
                        }
                    }
                });
                const like = await tx.songLike.create({
                    data: {
                        user: {
                            connect: {
                                id: userId
                            }
                        },
                        song: {
                            connect: {
                                id: songId
                            }
                        }
                    }
                });

                return { like, alreadyLiked: false };
            }
            return { like, alreadyLiked: true };
        });
    },

    unlikeSong: (userId: string, songId: string) => {
        return prismaClient.$transaction(async (tx) => {
            const like = await tx.songLike.findFirst({
                where: { userId, songId }
            });
            if (!like) {
                return false;
            }
            await tx.songLike.delete({
                where: {
                    userId_songId: {
                        userId,
                        songId
                    }
                }
            });
            await tx.song.update({
                where: { id: songId },
                data: {
                    likesCount: {
                        decrement: 1
                    }
                }
            });
            return true;
        });
    }
};

export const albumLikeRepo = {
    create: (
        data: Prisma.AlbumLikeCreateInput,
        options?: Omit<Prisma.AlbumLikeCreateArgs, "data">
    ) => {
        return prismaClient.albumLike.create({
            data: data,
            ...options
        });
    },

    getOneByFilter: (
        filter: Prisma.AlbumLikeWhereInput,
        options?: Omit<Prisma.AlbumLikeFindFirstArgs, "where">
    ) => {
        return prismaClient.albumLike.findFirst({
            where: filter,
            ...options
        });
    },

    getManyByFilter: (
        filter: Prisma.AlbumLikeWhereInput,
        options?: Omit<Prisma.AlbumLikeFindManyArgs, "where">
    ) => {
        return prismaClient.albumLike.findMany({
            where: filter,
            ...options
        });
    },

    delete: (
        filter: Prisma.AlbumLikeWhereUniqueInput,
        options?: Omit<Prisma.AlbumLikeDeleteArgs, "where">
    ) => {
        return prismaClient.albumLike.delete({
            where: filter,
            ...options
        });
    },

    likeAlbum: (userId: string, albumId: string) => {
        return prismaClient.$transaction(async (tx) => {
            const like = await tx.albumLike.findFirst({
                where: { userId, albumId }
            });
            if (!like) {
                await tx.album.update({
                    where: { id: albumId },
                    data: {
                        likesCount: {
                            increment: 1
                        }
                    }
                });
                return tx.albumLike.create({
                    data: {
                        album: {
                            connect: {
                                id: albumId
                            }
                        },
                        user: {
                            connect: {
                                id: userId
                            }
                        }
                    }
                });
            }
            return like;
        });
    },

    unlikeAlbum: (userId: string, albumId: string) => {
        return prismaClient.$transaction(async (tx) => {
            const like = await tx.albumLike.findFirst({
                where: { userId, albumId }
            });
            if (!like) {
                return;
            }
            await tx.albumLike.delete({
                where: {
                    userId_albumId: {
                        userId,
                        albumId
                    }
                }
            });
            await tx.album.update({
                where: { id: albumId },
                data: {
                    likesCount: {
                        decrement: 1
                    }
                }
            });
        });
    }
};
