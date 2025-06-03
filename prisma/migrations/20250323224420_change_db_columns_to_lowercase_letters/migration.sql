/*
  Warnings:

  - You are about to drop the column `audioFilePath` on the `songs` table. All the data in the column will be lost.
  - You are about to drop the column `coverImagePath` on the `songs` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `songs` table. All the data in the column will be lost.
  - You are about to drop the `userProfiles` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `audio_file_path` to the `songs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cover_image_path` to the `songs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `songs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "songs" DROP CONSTRAINT "songs_userId_fkey";

-- DropForeignKey
ALTER TABLE "userProfiles" DROP CONSTRAINT "userProfiles_userId_fkey";

-- AlterTable
ALTER TABLE "songs" DROP COLUMN "audioFilePath",
DROP COLUMN "coverImagePath",
DROP COLUMN "userId",
ADD COLUMN     "audio_file_path" TEXT NOT NULL,
ADD COLUMN     "cover_image_path" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "userProfiles";

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "phone" TEXT NOT NULL,
    "birth" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- AddForeignKey
ALTER TABLE "songs" ADD CONSTRAINT "songs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
