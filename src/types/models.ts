import { Prisma } from "@prisma/client";

export type FullyNestedUser = Prisma.UserGetPayload<{
    include: {
        userProfile: true;
    };
}>;

export type FullyNestedSong = Prisma.SongGetPayload<{
    include: {
        user: {
            include: {
                userProfile: true;
            };
        };
    };
}>;

export type FullyNestedAlbum = Prisma.AlbumGetPayload<{
    include: {
        user: {
            include: {
                userProfile: true;
            };
        };
        songs: true;
    };
}>;

type IsScalar<T> = T extends
    | string
    | number
    | boolean
    | bigint
    | symbol
    | null
    | undefined
    | Date
    ? true
    : false;

export type OptionalRelations<T> = {
    [K in keyof T as IsScalar<T[K]> extends true ? never : K]?: T[K];
} & {
    [K in keyof T as IsScalar<T[K]> extends true ? K : never]: T[K];
};

export type OptionalRelationsDeep<T> = {
    [K in keyof T as IsScalar<T[K]> extends true
        ? never
        : K]?: T[K] extends (infer U)[]
        ? U extends object
            ? Array<OptionalRelationsDeep<U>>
            : T[K]
        : T[K] extends object
          ? OptionalRelationsDeep<T[K]>
          : T[K];
} & {
    [K in keyof T as IsScalar<T[K]> extends true ? K : never]: T[K];
};
