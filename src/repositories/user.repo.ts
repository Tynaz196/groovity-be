import prismaClient from "@/databases/prisma.js";
import { omitPropsFromObject } from "@/utils/object.js";
import { Prisma, User, UserProfile } from "@prisma/client";
import { searchUser } from "@prisma/client/sql";

export const userRepo = {
    /* ---------------------------------- User ---------------------------------- */
    getOneByFilter: (
        filter: Prisma.UserWhereInput,
        options?: Omit<Prisma.UserFindFirstArgs, "where">
    ) => {
        return prismaClient.user.findFirst({
            where: filter,
            ...options
        });
    },
    getAllByFilter: (
        filter: Prisma.UserWhereInput,
        options?: Omit<Prisma.UserFindManyArgs, "where">
    ) => {
        return prismaClient.user.findMany({
            where: filter,
            ...options
        });
    },

    searchUsers: async (
        filter: { name?: string },
        options?: Omit<Prisma.UserFindManyArgs, "where">
    ): Promise<User[]> => {
        const { name = "" } = filter;
        const { skip = 0, take = 10 } = options ?? { undefined };
        const sql = searchUser(name, take, skip);
        const results = await prismaClient.$queryRawTyped(sql);
        const ids = results.map((result) => result.user_id);

        const users = await prismaClient.user.findMany({
            where: { id: { in: ids } },
            ...(options ? omitPropsFromObject(options, ["skip", "take"]) : {})
        });

        const idOrderMap = new Map(ids.map((id, index) => [id, index]));
        users.sort((a, b) => idOrderMap.get(a.id)! - idOrderMap.get(b.id)!);
        return users;
    },

    create: (
        data: Prisma.UserCreateInput,
        options?: Omit<Prisma.UserCreateArgs, "data">
    ): Promise<User> => {
        return prismaClient.user.create({
            data: data,
            ...options
        });
    },
    update: (
        filter: Prisma.UserWhereUniqueInput,
        data: Prisma.UserUpdateInput,
        options?: Omit<Prisma.UserUpdateArgs, "where" | "data">
    ): Promise<User> => {
        return prismaClient.user.update({
            where: filter,
            data: data,
            ...options
        });
    },

    /* ------------------------------ User Profiles ----------------------------- */

    createProfile: (
        data: Prisma.UserProfileCreateInput,
        options?: Omit<Prisma.UserProfileCreateArgs, "data">
    ): Promise<UserProfile> => {
        return prismaClient.userProfile.create({ data: data, ...options });
    },

    updateProfile: (
        filter: Prisma.UserProfileWhereUniqueInput,
        data: Prisma.UserProfileUpdateInput,
        options?: Omit<Prisma.UserProfileUpdateArgs, "where" | "data">
    ) => {
        return prismaClient.userProfile.update({
            where: filter,
            data: data,
            ...options
        });
    },
    getOneProfileByfilter: (
        filter: Prisma.UserProfileWhereInput,
        options?: Omit<Prisma.UserProfileFindFirstArgs, "where">
    ): Promise<UserProfile | null> => {
        return prismaClient.userProfile.findFirst({
            where: filter,
            ...options
        });
    },
    getAllProfileByFilter: (
        filter: Prisma.UserProfileWhereInput,
        options?: Omit<Prisma.UserProfileFindManyArgs, "where">
    ): Promise<UserProfile[]> => {
        return prismaClient.userProfile.findMany({ where: filter, ...options });
    }
};
