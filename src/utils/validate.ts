import { ValidationError } from "@/errors/index.js";
import { z, ZodError, ZodSchema } from "zod";

export const createValidator = <T extends ZodSchema>(schema: T) => {
    return (data: unknown): z.infer<T> => {
        try {
            return schema.parse(data);
        } catch (err) {
            if (err instanceof ZodError) {
                throw new ValidationError(err);
            } else {
                throw err;
            }
        }
    };
};
