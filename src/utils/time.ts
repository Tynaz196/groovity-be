import { CustomError } from "@/errors/index.js";
import { StatusCodes } from "http-status-codes";

export const timeToMs = (time: string): number => {
    const units: { [key: string]: number } = {
        s: 1000, // seconds
        m: 60 * 1000, // minutes
        h: 60 * 60 * 1000, // hours
        d: 24 * 60 * 60 * 1000 // days
    };

    const match = time.match(/^(\d+)([smhd])$/);
    if (!match)
        throw new CustomError(
            "Invalid time format",
            StatusCodes.INTERNAL_SERVER_ERROR
        );

    const value = parseInt(match[1], 10);
    const unit = match[2];

    return value * units[unit];
};
