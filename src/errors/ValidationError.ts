import { StatusCodes } from "http-status-codes";
import { CustomError } from "./CustomError.js";
import { ZodError } from "zod";
import _ from "lodash";
export class ValidationError extends CustomError {
    name = "Validation Error";
    zodErrors: ZodError;
    fieldErrors: Record<string, string[]>;
    constructor(err: ZodError) {
        const message = err.errors.map((e) => e.message).join(", ");
        super(message, StatusCodes.BAD_REQUEST);
        this.zodErrors = err;
        this.fieldErrors = _.mapValues(
            _.groupBy(err.errors, (curr) => curr.path.join(".")),
            (grouped) => _.map(grouped, "message")
        );
    }
}
