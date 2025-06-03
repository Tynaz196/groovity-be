import { connectPrisma, disconnectPrisma } from "./prisma.js";
import { connectRedis, disconnectRedis } from "./redis.js";

export const connectDbs = async () => {
    await connectRedis();
    await connectPrisma();
};

export const disconnectDbs = async () => {
    await disconnectRedis();
    await disconnectPrisma();
};
