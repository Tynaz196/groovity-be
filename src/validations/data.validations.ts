import { ValidationError } from "@/errors/index.js";
import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";

export const dataValidation = (schema: ZodSchema, type: "body" | "query") => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = type === "body" ? req.body : req.query;
            const parsedData = schema.parse(data);

            if (type === "body") {
                req.body = parsedData;
            } else {
                req.query = parsedData;
            }
            next();
        } catch (err) {
            if (err instanceof ZodError) {
                next(new ValidationError(err));
            } else {
                next(err);
            }
        }
    };
};
