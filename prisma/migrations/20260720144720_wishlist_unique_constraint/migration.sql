/*
  Warnings:

  - A unique constraint covering the columns `[user_id,product_id]` on the table `wishlist` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "wishlist_user_id_product_id_key" ON "wishlist"("user_id", "product_id");
