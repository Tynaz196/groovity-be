import { CustomError } from "./CustomError.js";

export class AuthenticationError extends CustomError {
    name = "Authentication Error";
    constructor(message: string, statusCode: number) {
        super(message, statusCode);
    }
}
