import { TshirtSize, TshirtType, mapTshirtType } from '../constants/tshirt';
import { CartStateItem } from './get-cart-details';

export const getCartItemDetails = (
  ingredients: CartStateItem['ingredients'],
  tshirtType?: TshirtType,
  tshirtSize?: TshirtSize,
): string => {
  const details = [];

  if (tshirtSize && tshirtType) {
    const typeName = mapTshirtType[tshirtType];
    details.push(`${typeName} ${tshirtSize} `);
  }

  if (ingredients) {
    details.push(...ingredients.map((ingredient) => ingredient.name));
  }

  return details.join(', ');
};
