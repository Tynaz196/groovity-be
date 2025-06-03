import { User, UserProfile } from "@prisma/client";

export type UserProfileDto = Omit<UserProfile, "avatarImagePath"> & {
    avatarImageUrl: string | null;
};

export type UserDto = Omit<User, "password"> & {
    userProfile?: UserProfileDto;
};

export type UpdateProfileDto = Partial<
    Pick<UserProfile, "name" | "phone" | "birth" | "gender">
>;

export type GetUsersDto = Partial<Pick<UserProfile, "name">> & {
    options: {
        limit: number;
        offset: number;
    };
};

export type GetUserLikedSongDto = { userId: string } & {
    options: {
        limit: number;
        offset: number;
        userProfiles: boolean;
    };
};

export type GetUserLikedAlbumDto = { userId: string } & {
    options: {
        limit: number;
        offset: number;
        userProfiles: boolean;
    };
};
