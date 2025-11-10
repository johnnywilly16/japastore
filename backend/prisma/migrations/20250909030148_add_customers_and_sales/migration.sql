-- CreateEnum
CREATE TYPE "public"."customer_type" AS ENUM ('vip', 'regular', 'occasional', 'new');

-- CreateEnum
CREATE TYPE "public"."visit_type" AS ENUM ('purchase', 'service', 'consultation', 'complaint');

-- CreateTable
CREATE TABLE "public"."customers" (
    "id" SERIAL NOT NULL,
    "external_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "cpf" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip_code" TEXT,
    "birth_date" DATE,
    "customer_type" "public"."customer_type" NOT NULL DEFAULT 'regular',
    "notes" TEXT,
    "total_spent" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_visits" INTEGER NOT NULL DEFAULT 0,
    "last_visit" TIMESTAMP(3),
    "average_days_between_visits" INTEGER,
    "preferred_payment_method" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sales" (
    "id" SERIAL NOT NULL,
    "external_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "customer_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "payment_method" TEXT NOT NULL,
    "sale_date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."customer_visits" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "visit_date" TIMESTAMP(3) NOT NULL,
    "visit_type" "public"."visit_type" NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_visits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_external_id_key" ON "public"."customers"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "public"."customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "customers_cpf_key" ON "public"."customers"("cpf");

-- CreateIndex
CREATE INDEX "idx_customers_external_id" ON "public"."customers" USING HASH ("external_id");

-- CreateIndex
CREATE INDEX "idx_customers_cpf" ON "public"."customers"("cpf");

-- CreateIndex
CREATE INDEX "idx_customers_email" ON "public"."customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sales_external_id_key" ON "public"."sales"("external_id");

-- CreateIndex
CREATE INDEX "idx_sales_external_id" ON "public"."sales" USING HASH ("external_id");

-- CreateIndex
CREATE INDEX "idx_sales_customer_id" ON "public"."sales"("customer_id");

-- CreateIndex
CREATE INDEX "idx_sales_date" ON "public"."sales"("sale_date");

-- CreateIndex
CREATE INDEX "idx_customer_visits_customer_id" ON "public"."customer_visits"("customer_id");

-- CreateIndex
CREATE INDEX "idx_customer_visits_date" ON "public"."customer_visits"("visit_date");

-- AddForeignKey
ALTER TABLE "public"."sales" ADD CONSTRAINT "sales_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales" ADD CONSTRAINT "sales_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customer_visits" ADD CONSTRAINT "customer_visits_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
