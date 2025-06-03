export * from "./user.repo.js";
export * from "./song.repo.js";
export * from "./album.repo.js";
export * from "./like.repo.js";
import prismaClient from "@/databases/prisma.js";

export const transaction = prismaClient.$transaction;
