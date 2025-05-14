import { Ingredient, ProductItem } from '@prisma/client';
import { TshirtSize, TshirtType } from '../constants/tshirt';

/**
 * Функция для подсчета общей стоимости пиццы
 *
 * @param type - тип теста выбранной пиццы
 * @param size - размер выбранной пиццы
 * @param items - список вариаций
 * @param ingredients - список ингредиентов
 * @param selectedIngredients - выбранные ингредиенты
 *
 * @returns number общую стоимость
 */
export const calcTotalTshirtPrice = (
  type: TshirtType,
  size: TshirtSize,
  items: ProductItem[],
  ingredients: Ingredient[],
  selectedIngredients: Set<number>,
) => {
  const tshirtPrice =
    items.find((item) => item.tshirtType === type && item.size === size)?.price || 0;

  const totalIngredientsPrice = ingredients
    .filter((ingredient) => selectedIngredients.has(ingredient.id))
    .reduce((acc, ingredient) => acc + ingredient.price, 0);

  return tshirtPrice + totalIngredientsPrice;
};
