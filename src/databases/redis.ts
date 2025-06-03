import { redisConfig } from "@/configs/redis.config.js";
import logger from "@/utils/logger.js";
import { createClient } from "redis";

const client = createClient(redisConfig);

export const connectRedis = async () => {
    try {
        await client.connect();
        logger.info("Redis is connected");
    } catch (err) {
        logger.error(`Cannot connect to Redis: ${err}`);
        process.exit(1);
    }
};

export const disconnectRedis = async () => {
    await client.quit();
    logger.info("Redis is disconnected");
};

client.on("error", (err) => {
    logger.error(`Redis error: ${err}`);
    process.exit(1);
});

export default client;
