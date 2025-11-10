-- AlterTable
ALTER TABLE "public"."products" ADD COLUMN     "category_id" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" SERIAL NOT NULL,
    "external_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "public"."categories"("name");

-- CreateIndex
CREATE INDEX "idx_categories_external_id" ON "public"."categories" USING HASH ("external_id");

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- TriggerFunction
CREATE OR REPLACE FUNCTION constraint_delete_default_category() RETURNS trigger as $$
BEGIN
    IF OLD.id = 1 THEN
        RAISE EXCEPTION 'Cannot delete the default category';
    END IF;
    RETURN OLD;
END
$$ LANGUAGE plpgsql;

-- CreateTrigger
CREATE TRIGGER prevent_default_category_deletion
    BEFORE DELETE ON "public"."categories"
    FOR EACH ROW EXECUTE FUNCTION constraint_delete_default_category();