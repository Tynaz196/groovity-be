import { z } from "zod";
import { userProfileSchema } from "./auth.schema.js";
import { booleanSchema } from "@/utils/zod.js";

export const updateUserProfileSchema = userProfileSchema.partial();

export const getUsersQuerySchema = z.object({
    name: z.string().optional(),
    limit: z.coerce
        .number({ message: "The limit must be an integer" })
        .int("The limit must be an integer")
        .positive("The limit must be positive")
        .optional(),
    offset: z.coerce
        .number({ message: "The offset must be an integer" })
        .int("The offset must be an integer")
        .nonnegative("The offset must not be negative")
        .optional()
});

export const getUserLikedSongsQuerySchema = z.object({
    limit: z.coerce
        .number({ message: "The limit must be an integer" })
        .int("The limit must be an integer")
        .positive("The limit must be positive")
        .optional(),
    offset: z.coerce
        .number({ message: "The offset must be an integer" })
        .int("The offset must be an integer")
        .nonnegative("The offset must not be negative")
        .optional(),
    userProfiles: booleanSchema.optional()
});

export const getUserLikedAlbumsQuerySchema = z.object({
    limit: z.coerce
        .number({ message: "The limit must be an integer" })
        .int("The limit must be an integer")
        .positive("The limit must be positive")
        .optional(),
    offset: z.coerce
        .number({ message: "The offset must be an integer" })
        .int("The offset must be an integer")
        .nonnegative("The offset must not be negative")
        .optional(),
    userProfiles: booleanSchema.optional()
});
