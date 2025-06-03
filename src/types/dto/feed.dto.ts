export type GetMostLikedSongDto = {
    options: {
        offset: number;
        limit: number;
        userProfiles: boolean;
    };
};

export type GetRecentlyMostLikedSongDto = {
    options: {
        limit: number;
        offset: number;
        userProfiles: boolean;
    };
};
