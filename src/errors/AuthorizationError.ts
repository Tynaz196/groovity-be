import { StatusCodes } from "http-status-codes";
import { CustomError } from "./CustomError.js";

export class AuthorizationError extends CustomError {
    name = "AuthorizationError";
    constructor(message: string) {
        super(message, StatusCodes.FORBIDDEN);
    }
}
