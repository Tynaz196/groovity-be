import { RedisClientOptions } from "redis";
import { envConfig } from "./env.config.js";

export const redisConfig: RedisClientOptions = {
    password: envConfig.REDIS_PASSWORD,
    socket: {
        host: envConfig.REDIS_HOST,
        port: envConfig.REDIS_PORT
    }
};

export enum namespaces {
    Verification = "verification",
    JWT_Token_Blacklist = "blacklist",
    JWT_Refresh_Token = "refresh_token",
    User = "user",
    Album = "album",
    Song = "song",
    Like = "like",
    Filepath = "path",
    Feed = "feed"
}
