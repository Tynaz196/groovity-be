import prismaClient from "@/databases/prisma.js";
import { omitPropsFromObject } from "@/utils/object.js";
import { Prisma, Song } from "@prisma/client";
import { searchSongs, searchSongsWithUserId } from "@prisma/client/sql";

export const songRepo = {
    create: (
        data: Prisma.SongCreateInput,
        options?: Omit<Prisma.SongCreateArgs, "data">
    ) => {
        return prismaClient.song.create({
            data: data,
            ...options
        });
    },

    getOneByFilter: (
        filter: Prisma.SongWhereInput,
        options?: Omit<Prisma.SongFindFirstArgs, "where">
    ) => {
        return prismaClient.song.findFirst({
            where: filter,
            ...options
        });
    },

    getManyByFilter: (
        filter: Prisma.SongWhereInput,
        options?: Omit<Prisma.SongFindManyArgs, "where">
    ) => {
        return prismaClient.song.findMany({
            where: filter,
            ...options
        });
    },

    getManyByIds: async (
        ids: string[],
        options?: Omit<Prisma.SongFindManyArgs, "where">
    ): Promise<Song[]> => {
        const songs = await prismaClient.song.findMany({
            where: {
                id: {
                    in: ids
                }
            },
            ...options
        });

        const songMap = new Map(songs.map((song) => [song.id, song]));

        return ids
            .map((id) => songMap.get(id))
            .filter((song): song is Song => song !== undefined);
    },

    searchSongs: async (
        filter: { userId?: string; name?: string },
        options?: Omit<Prisma.SongFindManyArgs, "where">
    ) => {
        const { name = "", userId } = filter;
        const { skip = 0, take = 10 } = options ?? { undefined };
        const sql = userId
            ? searchSongsWithUserId(name, take, skip, userId)
            : searchSongs(name, take, skip);
        const results = await prismaClient.$queryRawTyped(sql);
        const ids = results.map((result) => result.id);

        const songs = await prismaClient.song.findMany({
            where: { id: { in: ids } },
            ...(options ? omitPropsFromObject(options, ["skip", "take"]) : {})
        });

        const idOrderMap = new Map(ids.map((id, index) => [id, index]));
        songs.sort((a, b) => idOrderMap.get(a.id)! - idOrderMap.get(b.id)!);
        return songs;
    },

    update: (
        filter: Prisma.SongWhereUniqueInput,
        data: Prisma.SongUpdateInput,
        options?: Omit<Prisma.SongUpdateArgs, "where" | "data">
    ) => {
        return prismaClient.song.update({
            where: filter,
            data: data,
            ...options
        });
    },

    updateMany: (
        filter: Prisma.SongWhereInput,
        data: Prisma.SongUpdateInput,
        options?: Omit<Prisma.SongUpdateManyArgs, "where" | "data">
    ) => {
        return prismaClient.song.updateMany({
            where: filter,
            data,
            ...options
        });
    },

    delete: (
        filter: Prisma.SongWhereUniqueInput,
        options?: Omit<Prisma.SongDeleteArgs, "where">
    ): Promise<Song> => {
        return prismaClient.song.delete({
            where: filter,
            ...options
        });
    }
};
