-- CreateEnum
CREATE TYPE "public"."contact_type" AS ENUM ('lead', 'prospect', 'client', 'partner', 'supplier');

-- CreateEnum
CREATE TYPE "public"."contact_priority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "public"."contact_status" AS ENUM ('active', 'inactive', 'qualified', 'unqualified', 'converted', 'lost');

-- CreateEnum
CREATE TYPE "public"."interaction_type" AS ENUM ('call', 'email', 'meeting', 'note', 'task', 'demo', 'proposal', 'follow_up');

-- CreateTable
CREATE TABLE "public"."contacts" (
    "id" SERIAL NOT NULL,
    "external_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "position" TEXT,
    "contact_type" "public"."contact_type" NOT NULL DEFAULT 'lead',
    "source" TEXT,
    "priority" "public"."contact_priority" NOT NULL DEFAULT 'medium',
    "status" "public"."contact_status" NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "tags" TEXT[],
    "custom_fields" JSONB,
    "customer_id" INTEGER,
    "is_customer" BOOLEAN NOT NULL DEFAULT false,
    "ai_score" DOUBLE PRECISION,
    "ai_insights" JSONB,
    "last_ai_analysis" TIMESTAMP(3),
    "total_interactions" INTEGER NOT NULL DEFAULT 0,
    "last_interaction" TIMESTAMP(3),
    "next_follow_up" TIMESTAMP(3),
    "email_opens" INTEGER NOT NULL DEFAULT 0,
    "email_clicks" INTEGER NOT NULL DEFAULT 0,
    "call_duration" INTEGER NOT NULL DEFAULT 0,
    "meetings_scheduled" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contact_interactions" (
    "id" SERIAL NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "type" "public"."interaction_type" NOT NULL,
    "description" TEXT NOT NULL,
    "outcome" TEXT,
    "scheduled_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "duration" INTEGER,
    "notes" TEXT,
    "attachments" TEXT[],
    "follow_up_date" TIMESTAMP(3),
    "ai_summary" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contacts_external_id_key" ON "public"."contacts"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_email_key" ON "public"."contacts"("email");

-- CreateIndex
CREATE INDEX "idx_contacts_external_id" ON "public"."contacts" USING HASH ("external_id");

-- CreateIndex
CREATE INDEX "idx_contacts_email" ON "public"."contacts"("email");

-- CreateIndex
CREATE INDEX "idx_contacts_type" ON "public"."contacts"("contact_type");

-- CreateIndex
CREATE INDEX "idx_contacts_ai_score" ON "public"."contacts"("ai_score");

-- CreateIndex
CREATE INDEX "idx_contacts_priority" ON "public"."contacts"("priority");

-- CreateIndex
CREATE INDEX "idx_contact_interactions_contact_id" ON "public"."contact_interactions"("contact_id");

-- CreateIndex
CREATE INDEX "idx_contact_interactions_type" ON "public"."contact_interactions"("type");

-- CreateIndex
CREATE INDEX "idx_contact_interactions_scheduled" ON "public"."contact_interactions"("scheduled_at");

-- AddForeignKey
ALTER TABLE "public"."contacts" ADD CONSTRAINT "contacts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contact_interactions" ADD CONSTRAINT "contact_interactions_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
