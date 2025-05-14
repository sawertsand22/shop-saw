import { Cart, CartItem, Ingredient, Product, ProductItem } from '@prisma/client';

export type CartItemDTO = CartItem & {
  productItem: ProductItem & {
    product: Product;
  };
  ingredients: Ingredient[];
};

export interface CartDTO extends Cart {
  items: CartItemDTO[];
}

export interface CreateCartItemValues {
  productItemId?: number;
  ingredients?: number[];
    // Добавляем тип
  customDesignUrl?: string; // Кастомный дизайн (новое поле)
  price?: number; 

   size?: number;        // Добавляем размер
  tshirtType?: number; 
}
