import { create } from 'zustand';
import { Api } from '../services/api-client';
import { getCartDetails } from '../lib';
import { CartStateItem } from '../lib/get-cart-details';
import { CreateCartItemValues } from '../services/dto/cart.dto';

export interface CartState {
  loading: boolean;
  error: boolean;
  totalAmount: number;
  items: CartStateItem[];

  /* Получение товаров из корзины */
  fetchCartItems: () => Promise<void>;

  /* Запрос на обновление количества товара */
  updateItemQuantity: (id: number, quantity: number) => Promise<void>;

  /* Запрос на добавление обычного товара в корзину */
  addCartItem: (values: CreateCartItemValues) => Promise<void>;

  /* Запрос на добавление кастомного дизайна в корзину */
  addCustomDesignItem: (customDesignUrl: string, price?: number) => Promise<void>;

  /* Запрос на удаление товара из корзины */
  removeCartItem: (id: number) => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  error: false,
  loading: true,
  totalAmount: 0,

  fetchCartItems: async () => {
    try {
      set({ loading: true, error: false });
      const data = await Api.cart.getCart();
      set(getCartDetails(data));
    } catch (error) {
      console.error(error);
      set({ error: true });
    } finally {
      set({ loading: false });
    }
  },

  updateItemQuantity: async (id: number, quantity: number) => {
    try {
      set({ loading: true, error: false });
      const data = await Api.cart.updateItemQuantity(id, quantity);
      set(getCartDetails(data));
    } catch (error) {
      console.error(error);
      set({ error: true });
    } finally {
      set({ loading: false });
    }
  },

  removeCartItem: async (id: number) => {
    try {
      set((state) => ({
        loading: true,
        error: false,
        items: state.items.map((item) => (item.id === id ? { ...item, disabled: true } : item)),
      }));
      const data = await Api.cart.removeCartItem(id);
      set(getCartDetails(data));
    } catch (error) {
      console.error(error);
      set({ error: true });
    } finally {
      set((state) => ({
        loading: false,
        items: state.items.map((item) => ({ ...item, disabled: false })),
      }));
    }
  },

  addCartItem: async (values: CreateCartItemValues) => {
    try {
      set({ loading: true, error: false });
      const data = await Api.cart.addCartItem(values);
      set(getCartDetails(data));
    } catch (error) {
      console.error(error);
      set({ error: true });
    } finally {
      set({ loading: false });
    }
  },


  addCustomDesignItem: async (customDesignUrl: string, price = 1500) => {
    try {
      set({ loading: true, error: false });
      const data = await Api.cart.addCartItem({ customDesignUrl, price });
      set(getCartDetails(data));
    } catch (error) {
      console.error('[addCustomDesignItem]', error);
      set({ error: true });
    } finally {
      set({ loading: false });
    }
  },
//addCustomDesignItem: async (customDesignUrl: string, price = 777) => {
//     try {
//       set({ loading: true, error: false });
//       const res = await fetch("/api/cart", {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({ customDesignUrl, price }),
// });

// if (!res.ok) {
//   const err = await res.json();
//   throw new Error(err.message || "Ошибка при добавлении");
// }

// const data = await res.json();
// set(getCartDetails(data));

//       set(getCartDetails(data));
//     } catch (error) {
//       console.error('[addCustomDesignItem]', error);
//       set({ error: true });
//     } finally {
//       set({ loading: false });
//     }
//   },
}));
