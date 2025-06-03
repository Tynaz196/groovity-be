/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from "express";
import {
    AuthenticationError,
    AuthorizationError,
    CustomError,
    ValidationError
} from "@/errors/index.js";
import { omitPropsFromObject } from "@/utils/object.js";
import { StatusCodes } from "http-status-codes";
import logger from "@/utils/logger.js";
import { Prisma } from "@prisma/client";

export const errorMiddleware = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // validation error
    if (err instanceof ValidationError) {
        logger.warn("Validation error: " + err.message);
        res.status(err.statusCode).json({
            status: "failed",
            error: {
                type: err.name,
                message: err.message,
                details: omitPropsFromObject(err, ["zodErrors"]).fieldErrors
            }
        });
        return;
    }
    // authentication error
    if (err instanceof AuthenticationError) {
        logger.warn("Authentication error: " + err.message);
        res.status(err.statusCode).json({
            status: "failed",
            error: {
                type: err.name,
                message: err.message
            }
        });
        return;
    }
    // authorization error
    if (err instanceof AuthorizationError) {
        logger.warn("Authorization error: " + err.message);
        res.status(err.statusCode).json({
            status: "failed",
            error: {
                type: err.name,
                message: err.message
            }
        });
        return;
    }
    // custom error
    if (err instanceof CustomError) {
        logger.info("Custom error: " + err.message);
        res.status(err.statusCode).json({
            status: "failed",
            error: {
                message: err.message
            }
        });
        return;
    }
    // Prisma client known error
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        logger.warn("Prisma known error: " + err.message);
        const statusCode =
            err.code === "P2002" // unique constraint failed
                ? StatusCodes.CONFLICT
                : err.code === "P2025" // record not found
                  ? StatusCodes.NOT_FOUND
                  : StatusCodes.BAD_REQUEST;

        res.status(statusCode).json({
            status: "failed",
            error: {
                type: "DatabaseError",
                code: err.code,
                message: err.message
            }
        });
        return;
    }

    // Prisma client validation error
    if (err instanceof Prisma.PrismaClientValidationError) {
        logger.warn("Prisma validation error: " + err.message);
        res.status(StatusCodes.BAD_REQUEST).json({
            status: "failed",
            error: {
                type: "DatabaseValidationError",
                message: err.message
            }
        });
        return;
    }

    // Prisma initialization or connection error
    if (
        err instanceof Prisma.PrismaClientInitializationError ||
        err instanceof Prisma.PrismaClientRustPanicError
    ) {
        logger.error("Critical Prisma error: " + err.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: "failed",
            error: {
                type: "CriticalDatabaseError",
                message:
                    "A critical database error occurred. Please try again later."
            }
        });
        return;
    }

    // fallback for unexpected errors
    logger.error(err.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: "failed",
        error: {
            message: err.message
        }
    });
};
