/*
  Warnings:

  - You are about to drop the column `createdAt` on the `likes` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "likes_userId_songId_key";

-- AlterTable
ALTER TABLE "likes" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "likes_created_at_idx" ON "likes"("created_at");
