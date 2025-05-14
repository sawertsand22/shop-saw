import { calcTotalPizzaPrice } from './calc-total-pizza-price';
import { Ingredient, ProductItem } from '@prisma/client';
import { TshirtSize, TshirtType, mapTshirtType } from '../constants/tshirt';

export const getPizzaDetails = (
  type: TshirtType,
  size: TshirtSize,
  items: ProductItem[],
  ingredients: Ingredient[],
  selectedIngredients: Set<number>,
) => {
  const totalPrice = calcTotalPizzaPrice(type, size, items, ingredients, selectedIngredients);
  const textDetaills = `${size} см, ${mapTshirtType[type]} пицца`;

  return { totalPrice, textDetaills };
};
