import logger from "@/utils/logger.js";
import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

export const connectPrisma = async () => {
    await client
        .$connect()
        .then(() => {
            logger.info("Database is connected");
        })
        .catch((err: Error) => {
            logger.error(`Failed to connect to database: ${err.message}`);
            process.exit(1);
        });
};
export const disconnectPrisma = async () => {
    await client.$disconnect();
    logger.info("Prisma is disconnected");
};

export default client;
