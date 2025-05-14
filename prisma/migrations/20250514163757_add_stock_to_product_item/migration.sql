/*
  Warnings:

  - You are about to drop the column `pizzaType` on the `ProductItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProductItem" DROP COLUMN "pizzaType",
ADD COLUMN     "tshirtType" INTEGER;
