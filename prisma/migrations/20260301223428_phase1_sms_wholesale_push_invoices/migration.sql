-- CreateEnum
CREATE TYPE "WholesaleOrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED', 'COMPLETED');

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "category" TEXT,
ADD COLUMN     "user_id" TEXT,
ALTER COLUMN "order_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "stripe_invoice_id" TEXT,
ADD COLUMN     "stripe_invoice_url" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "related_product_ids" TEXT[];

-- AlterTable
ALTER TABLE "wholesale_price_items" ADD COLUMN     "is_featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_todays_special" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wholesale_orders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "WholesaleOrderStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "admin_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wholesale_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wholesale_order_items" (
    "id" TEXT NOT NULL,
    "wholesale_order_id" TEXT NOT NULL,
    "wholesale_price_item_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "wholesale_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wholesale_orders" ADD CONSTRAINT "wholesale_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wholesale_order_items" ADD CONSTRAINT "wholesale_order_items_wholesale_order_id_fkey" FOREIGN KEY ("wholesale_order_id") REFERENCES "wholesale_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wholesale_order_items" ADD CONSTRAINT "wholesale_order_items_wholesale_price_item_id_fkey" FOREIGN KEY ("wholesale_price_item_id") REFERENCES "wholesale_price_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
