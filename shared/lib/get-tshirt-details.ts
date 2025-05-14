import { calcTotalTshirtPrice } from './calc-total-tshirt-price';
import { Ingredient, ProductItem } from '@prisma/client';
import { TshirtSize, TshirtType, mapTshirtType } from '../constants/tshirt';

export const getTshirtDetails = (
  type: TshirtType,
  size: TshirtSize,
  items: ProductItem[],
  ingredients: Ingredient[],
  selectedIngredients: Set<number>,
) => {
  const totalPrice = calcTotalTshirtPrice(type, size, items, ingredients, selectedIngredients);
  const textDetaills = `${size} , ${mapTshirtType[type]} футболка`;

  return { totalPrice, textDetaills };
};
