import { envConfig } from "@/configs/index.js";
import { CustomError } from "@/errors/index.js";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { timeToMs } from "./time.js";
export const generateJwt = (
    payload: string | object | Buffer,
    type: "at" | "rt"
): string => {
    const { secret, exp } =
        type == "at"
            ? {
                  secret: envConfig.JWT_ACCESS_SECRET,
                  exp: timeToMs(envConfig.JWT_ACCESS_EXP) / 1000
              }
            : {
                  secret: envConfig.JWT_REFRESH_SECRET,
                  exp: timeToMs(envConfig.JWT_REFRESH_EXP) / 1000
              };
    if (!secret) {
        throw new CustomError(
            "JWT secret key is not found",
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
    return jwt.sign(payload, secret, { expiresIn: exp });
};
