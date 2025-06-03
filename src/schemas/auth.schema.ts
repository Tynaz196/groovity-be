import { passwordRegex, phoneRegex, usernameRegex } from "@/utils/regex.js";
import { z } from "zod";
import { Gender } from "@prisma/client";

export const userProfileSchema = z.object({
    name: z.string().min(1, "Missing name"),
    birth: z.coerce
        .string()
        .date("Invalid date format, must be YYYY-MM-DD")
        .refine(
            (value) => {
                const birthDate = new Date(value);
                const now = new Date();
                const age = now.getFullYear() - birthDate.getFullYear();
                const isValidAge =
                    age > 0 &&
                    (age > 18 ||
                        (age === 18 &&
                            now >=
                                new Date(
                                    birthDate.setFullYear(
                                        birthDate.getFullYear() + 18
                                    )
                                )));
                return birthDate < now && isValidAge;
            },
            {
                message:
                    "You must provide a valid birthday and be at least 18 years old"
            }
        ),
    gender: z.nativeEnum(Gender),
    phone: z.string().regex(phoneRegex)
});

export const signUpSchema = z.object({
    username: z.string().regex(usernameRegex),
    email: z.string().email("Must be an valid email"),
    password: z.string().regex(passwordRegex),
    userProfile: userProfileSchema
});

export const signInSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string()
});

export const verifyCodeSchema = z.object({
    code: z
        .string()
        .length(6, "Code must be exactly 6 characters long.")
        .refine(
            (value) => !isNaN(Number(value)),
            "Code must only contain digits."
        )
});
