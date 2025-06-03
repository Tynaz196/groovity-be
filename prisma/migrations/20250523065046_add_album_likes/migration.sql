/*
  Warnings:

  - You are about to drop the `likes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "likes" DROP CONSTRAINT "likes_songId_fkey";

-- DropForeignKey
ALTER TABLE "likes" DROP CONSTRAINT "likes_userId_fkey";

-- DropTable
DROP TABLE "likes";

-- CreateTable
CREATE TABLE "song_likes" (
    "userId" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "song_likes_pkey" PRIMARY KEY ("userId","songId")
);

-- CreateTable
CREATE TABLE "album_likes" (
    "userId" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "album_likes_pkey" PRIMARY KEY ("userId","albumId")
);

-- CreateIndex
CREATE INDEX "song_likes_created_at_idx" ON "song_likes"("created_at");

-- CreateIndex
CREATE INDEX "album_likes_created_at_idx" ON "album_likes"("created_at");

-- AddForeignKey
ALTER TABLE "song_likes" ADD CONSTRAINT "song_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "song_likes" ADD CONSTRAINT "song_likes_songId_fkey" FOREIGN KEY ("songId") REFERENCES "songs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "album_likes" ADD CONSTRAINT "album_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "album_likes" ADD CONSTRAINT "album_likes_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "albums"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
