-- CreateIndex
CREATE INDEX "user_profiles_name_idx" ON "user_profiles" USING GIN ("name" gin_trgm_ops);
