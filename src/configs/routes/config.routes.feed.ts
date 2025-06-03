import { defaultRoutesConfigProps } from "./config.routes.default.js";

interface feedRouteConfigProps extends defaultRoutesConfigProps {
    getMostLikedSongs: string;
    getRecentlyLikedSongs: string;
}

export const feedRouteConfig: feedRouteConfigProps = {
    index: "/feeds",
    status: "/status",
    getMostLikedSongs: "/most-liked-songs",
    getRecentlyLikedSongs: "/recently-liked-songs"
};
