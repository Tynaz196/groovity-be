import { User } from "@prisma/client";

export type UserPayload = Pick<User, "id" | "isVerified">;
