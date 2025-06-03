-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateIndex
CREATE INDEX "songs_name_idx" ON "songs" USING GIN ("name" gin_trgm_ops);
