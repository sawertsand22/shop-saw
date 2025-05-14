import { TshirtSize, TshirtType, mapTshirtType } from '../constants/tshirt';
import { CartStateItem } from './get-cart-details';

export const getCartItemDetails = (
  ingredients: CartStateItem['ingredients'],
  pizzaType?: TshirtType,
  pizzaSize?: TshirtSize,
): string => {
  const details = [];

  if (pizzaSize && pizzaType) {
    const typeName = mapTshirtType[pizzaType];
    details.push(`${typeName} ${pizzaSize} см`);
  }

  if (ingredients) {
    details.push(...ingredients.map((ingredient) => ingredient.name));
  }

  return details.join(', ');
};
