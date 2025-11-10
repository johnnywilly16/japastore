/*
  Warnings:

  - You are about to drop the column `customer_contact` on the `service_orders` table. All the data in the column will be lost.
  - You are about to drop the column `customer_name` on the `service_orders` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `service_orders` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `service_orders` table. All the data in the column will be lost.
  - Added the required column `customer_id` to the `service_orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `device_model` to the `service_orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `problem` to the `service_orders` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "service_order_priority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- AlterEnum
ALTER TYPE "reference_type" ADD VALUE 'sale';

-- AlterTable
ALTER TABLE "service_orders" DROP COLUMN "customer_contact",
DROP COLUMN "customer_name",
DROP COLUMN "description",
DROP COLUMN "price",
ADD COLUMN     "customer_id" INTEGER NOT NULL,
ADD COLUMN     "device_model" TEXT NOT NULL,
ADD COLUMN     "estimated_cost" DECIMAL(10,2),
ADD COLUMN     "priority" "service_order_priority" NOT NULL DEFAULT 'medium',
ADD COLUMN     "problem" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "idx_service_orders_customer_id" ON "service_orders"("customer_id");

-- CreateIndex
CREATE INDEX "idx_service_orders_status" ON "service_orders"("status");

-- AddForeignKey
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
