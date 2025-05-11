/*
  Warnings:

  - You are about to drop the column `customImageUrl` on the `CartItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CartItem" DROP COLUMN "customImageUrl";

-- AlterTable
ALTER TABLE "ProductItem" ADD COLUMN     "customImageUrl" TEXT;
