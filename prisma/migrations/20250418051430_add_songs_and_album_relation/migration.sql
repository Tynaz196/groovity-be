/*
  Warnings:

  - A unique constraint covering the columns `[album_id,album_order]` on the table `songs` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "songs" ADD COLUMN     "album_id" TEXT,
ADD COLUMN     "album_order" INTEGER;

-- CreateTable
CREATE TABLE "albums" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cover_image_path" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "albums_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
ALTER TABLE "songs" ADD CONSTRAINT "songs_album_id_album_order_key" UNIQUE ("album_id", "album_order") DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "songs" ADD CONSTRAINT "songs_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "albums"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "albums" ADD CONSTRAINT "albums_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
