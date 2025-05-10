/*
  Warnings:

  - You are about to drop the `_CartItemToIngredient` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CartItemToIngredient" DROP CONSTRAINT "_CartItemToIngredient_A_fkey";

-- DropForeignKey
ALTER TABLE "_CartItemToIngredient" DROP CONSTRAINT "_CartItemToIngredient_B_fkey";

-- DropTable
DROP TABLE "_CartItemToIngredient";

-- CreateTable
CREATE TABLE "_CartItemIngredients" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CartItemIngredients_AB_unique" ON "_CartItemIngredients"("A", "B");

-- CreateIndex
CREATE INDEX "_CartItemIngredients_B_index" ON "_CartItemIngredients"("B");

-- AddForeignKey
ALTER TABLE "_CartItemIngredients" ADD CONSTRAINT "_CartItemIngredients_A_fkey" FOREIGN KEY ("A") REFERENCES "CartItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CartItemIngredients" ADD CONSTRAINT "_CartItemIngredients_B_fkey" FOREIGN KEY ("B") REFERENCES "Ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
