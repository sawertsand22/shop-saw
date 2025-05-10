/*
  Warnings:

  - You are about to drop the `_CartItemIngredient` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CartItemIngredient" DROP CONSTRAINT "_CartItemIngredient_A_fkey";

-- DropForeignKey
ALTER TABLE "_CartItemIngredient" DROP CONSTRAINT "_CartItemIngredient_B_fkey";

-- DropTable
DROP TABLE "_CartItemIngredient";

-- CreateTable
CREATE TABLE "_CartItemToIngredient" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CartItemToIngredient_AB_unique" ON "_CartItemToIngredient"("A", "B");

-- CreateIndex
CREATE INDEX "_CartItemToIngredient_B_index" ON "_CartItemToIngredient"("B");

-- AddForeignKey
ALTER TABLE "_CartItemToIngredient" ADD CONSTRAINT "_CartItemToIngredient_A_fkey" FOREIGN KEY ("A") REFERENCES "CartItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CartItemToIngredient" ADD CONSTRAINT "_CartItemToIngredient_B_fkey" FOREIGN KEY ("B") REFERENCES "Ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_CartItemToIngredient" REPLICA IDENTITY FULL;