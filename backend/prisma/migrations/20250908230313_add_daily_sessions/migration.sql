/*
  Warnings:

  - A unique constraint covering the columns `[external_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."daily_session_status" AS ENUM ('active', 'completed', 'cancelled');

-- CreateTable
CREATE TABLE "public"."daily_sessions" (
    "id" SERIAL NOT NULL,
    "external_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "status" "public"."daily_session_status" NOT NULL DEFAULT 'active',
    "total_sales" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "sales_count" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_sessions_external_id_key" ON "public"."daily_sessions"("external_id");

-- CreateIndex
CREATE INDEX "idx_daily_sessions_external_id" ON "public"."daily_sessions" USING HASH ("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_sessions_user_id_date_key" ON "public"."daily_sessions"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "users_external_id_key" ON "public"."users"("external_id");

-- AddForeignKey
ALTER TABLE "public"."daily_sessions" ADD CONSTRAINT "daily_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
