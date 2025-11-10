-- CreateEnum
CREATE TYPE "public"."service_order_status" AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."reference_type" AS ENUM ('service_order', 'purchase');

-- CreateEnum
CREATE TYPE "public"."movement_type" AS ENUM ('addition', 'removal');

-- CreateEnum
CREATE TYPE "public"."cost_type" AS ENUM ('stock_product', 'external_service');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "external_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."service_orders" (
    "id" SERIAL NOT NULL,
    "external_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "customer_name" TEXT NOT NULL,
    "customer_contact" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "description" TEXT NOT NULL,
    "status" "public"."service_order_status" NOT NULL DEFAULT 'pending',
    "completion_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" SERIAL NOT NULL,
    "external_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "stock_quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."service_orders_cost" (
    "id" SERIAL NOT NULL,
    "service_order_id" INTEGER NOT NULL,
    "product_id" INTEGER,
    "description" TEXT NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "type" "public"."cost_type" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_orders_cost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."stock_movements" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "movement_type" "public"."movement_type" NOT NULL,
    "reference_type" "public"."reference_type" NOT NULL,
    "reference_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "idx_users_external_id" ON "public"."users" USING HASH ("external_id");

-- CreateIndex
CREATE INDEX "idx_service_orders_external_id" ON "public"."service_orders" USING HASH ("external_id");

-- CreateIndex
CREATE INDEX "idx_products_external_id" ON "public"."products" USING HASH ("external_id");

-- AddForeignKey
ALTER TABLE "public"."service_orders_cost" ADD CONSTRAINT "service_orders_cost_service_order_id_fkey" FOREIGN KEY ("service_order_id") REFERENCES "public"."service_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."service_orders_cost" ADD CONSTRAINT "service_orders_cost_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stock_movements" ADD CONSTRAINT "stock_movements_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTriggerFunction
CREATE OR REPLACE FUNCTION stock_quantity_trigger_function() RETURNS trigger as $$
BEGIN
    IF NEW.type = 'addition' THEN
        UPDATE products SET stock_quantity = stock_quantity + NEW.quantity WHERE id = NEW.product_id;
    ELSIF NEW.type = 'removal' THEN
        IF (SELECT stock_quantity FROM products WHERE id = NEW.product_id) < NEW.quantity THEN
            RAISE EXCEPTION 'Insufficient stock for product ID %', NEW.product_id;
        END IF;
        UPDATE products SET stock_quantity = stock_quantity - NEW.quantity WHERE id = NEW.product_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- CreateTrigger
CREATE TRIGGER stock_quantity_trigger
    AFTER INSERT ON stock_movements
    FOR EACH ROW
EXECUTE FUNCTION stock_quantity_trigger_function();