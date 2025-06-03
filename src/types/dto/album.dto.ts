import { Album } from "@prisma/client";
import { UserDto, UserProfileDto } from "./user.dto.js";
import { SongDto } from "./song.dto.js";

export type AlbumDto = Omit<Album, "coverImagePath"> & {
    coverImageUrl: string | null;
    userProfile?: UserProfileDto;
    songs?: SongDto[];
    user?: UserDto;
};

export type CreateAlbumDto = {
    name: string;
};

export type UpdateAlbumDto = {
    name?: string;
};

export type GetAlbumDto = Pick<Album, "id"> & {
    options: {
        userProfile: boolean;
        songs: boolean;
    };
    userId?: string;
};

export type GetAlbumsDto = Partial<Pick<Album, "name" | "userId">> & {
    options: {
        limit: number;
        offset: number;
        userProfiles: boolean;
    };
    loginUserId?: string;
};
