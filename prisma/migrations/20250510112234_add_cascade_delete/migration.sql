/*
  Warnings:

  - You are about to drop the `_CartItemIngredients` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CartItemIngredients" DROP CONSTRAINT "_CartItemIngredients_A_fkey";

-- DropForeignKey
ALTER TABLE "_CartItemIngredients" DROP CONSTRAINT "_CartItemIngredients_B_fkey";

-- DropTable
DROP TABLE "_CartItemIngredients";

-- CreateTable
CREATE TABLE "_CartItemIngredient" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CartItemIngredient_AB_unique" ON "_CartItemIngredient"("A", "B");

-- CreateIndex
CREATE INDEX "_CartItemIngredient_B_index" ON "_CartItemIngredient"("B");

-- AddForeignKey
ALTER TABLE "_CartItemIngredient" ADD CONSTRAINT "_CartItemIngredient_A_fkey" FOREIGN KEY ("A") REFERENCES "CartItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CartItemIngredient" ADD CONSTRAINT "_CartItemIngredient_B_fkey" FOREIGN KEY ("B") REFERENCES "Ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
