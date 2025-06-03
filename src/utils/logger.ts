import { createLogger, format, transports } from "winston";
import { Request, Response, NextFunction } from "express";
import { envConfig } from "@/configs/index.js";

const { combine, timestamp, colorize, errors, printf } = format;

const logger = createLogger({
    level: envConfig.LOG_LEVEL,
    format: combine(
        colorize(),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
        errors({ stack: true }),
        printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [new transports.Console()]
});

// Middleware for logging HTTP requests in Express
export const requestLogger = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    logger.info(`${req.method} ${req.url}`);
    next();
};

export default logger;
