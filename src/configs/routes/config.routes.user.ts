import { defaultRoutesConfigProps } from "./config.routes.default.js";

interface userRouteConfigProps extends defaultRoutesConfigProps {
    updateAvatar: string;
    updateProfile: string;
    getUser: string;
    getUsers: string;
    getUserLikedSongs: string;
    getUserLikedAlbums: string;
}

export const userRouteConfig: userRouteConfigProps = {
    index: "/users",
    status: "/status",
    updateAvatar: "/me/profiles/avatar",
    updateProfile: "/profiles",
    getUser: "/:id",
    getUsers: "/many",
    getUserLikedSongs: "/me/liked-songs",
    getUserLikedAlbums: "/me/liked-albums"
};
