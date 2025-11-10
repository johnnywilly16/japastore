/*
  Warnings:

  - A unique constraint covering the columns `[external_id]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[external_id]` on the table `products` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "categories_external_id_key" ON "public"."categories"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_external_id_key" ON "public"."products"("external_id");
