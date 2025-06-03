import { booleanSchema } from "@/utils/zod.js";
import { z } from "zod";

export const getMostLikedSongsSchema = z.object({
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

export const getRecentlyMostLikedSongSchema = z.object({
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
