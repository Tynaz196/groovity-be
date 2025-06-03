import { defaultRoutesConfigProps } from "./config.routes.default.js";

interface albumRouteConfigProps extends defaultRoutesConfigProps {
    createAlbum: string;
    updateAlbum: string;
    updateCoverImage: string;
    addSong: string;
    addSongs: string;
    setSongs: string;
    deleteSongs: string;
    publicAlbum: string;
    likeAlbum: string;
    unlikeAlbum: string;
    likeStatus: string;
    getAlbum: string;
    getAlbums: string;
}

export const albumRouteConfig: albumRouteConfigProps = {
    index: "/albums",
    status: "/status",
    createAlbum: "/",
    updateAlbum: "/:id",
    updateCoverImage: "/:id/cover",
    addSong: "/:albumId/songs/insert/:songId",
    addSongs: "/:albumId/songs/append",
    setSongs: "/:albumId/songs/set",
    deleteSongs: "/:albumId/songs/",
    publicAlbum: "/:id/public",
    likeAlbum: "/:id/like",
    unlikeAlbum: "/:id/unlike",
    likeStatus: "/:id/like-status",
    getAlbum: "/:id",
    getAlbums: "/many"
};
