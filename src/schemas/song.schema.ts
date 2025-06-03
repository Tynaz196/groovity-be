import { booleanSchema } from "@/utils/zod.js";
import { z } from "zod";

export const uploadSongSchema = z.object({
    name: z.string().min(1, "Name required"),
    lyric: z.string().optional()
});

export const getSongsSchema = z.object({
    name: z.string().optional(),
    userId: z.string().optional(),
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

export const getSongQuerySchema = z.object({
    userProfile: booleanSchema.optional()
});
