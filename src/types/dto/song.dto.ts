import { Song } from "@prisma/client";
import { UserDto } from "./user.dto.js";

export type SongDto = Omit<
    Song,
    "audioFilePath" | "coverImagePath" | "albumOrder"
> & {
    coverImageUrl: string | null;
    user?: UserDto;
};

export type CreateSongDto = {
    name: string;
    lyric?: string;
};

export type GetSongDto = Pick<Song, "id"> & {
    options: {
        userProfile: boolean;
    };
};

export type GetSongsDto = Partial<Pick<Song, "name" | "userId">> & {
    options: {
        limit: number;
        offset: number;
        userProfiles: boolean;
    };
};
