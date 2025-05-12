import { prisma } from '@/prisma/prisma-client';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { findOrCreateCart } from '@/shared/lib/find-or-create-cart';
import { CreateCartItemValues } from '@/shared/services/dto/cart.dto';
import { updateCartTotalAmount } from '@/shared/lib/update-cart-total-amount';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('cartToken')?.value;

    if (!token) {
      return NextResponse.json({ totalAmount: 0, items: [] });
    }

    const userCart = await prisma.cart.findFirst({
      where: {
        token,
      },
      include: {
        items: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            productItem: {
              include: {
                product: true,
              },
            },
            ingredients: true,
          },
        },
      },
    });

    return NextResponse.json(userCart);
  } catch (error) {
    console.log('[CART_GET] Server error', error);
    return NextResponse.json({ message: 'Не удалось получить корзину' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let token = req.cookies.get('cartToken')?.value;

    if (!token) {
      token = crypto.randomUUID();
    }

    const userCart = await findOrCreateCart(token);
    const data = (await req.json()) as CreateCartItemValues;
    //console.log("== Данные запроса:", data);



    // ✅ Проверяем: это кастомный дизайн?
    if (data.customDesignUrl) {
      //console.log("== Добавление кастомного дизайна ==");

      // Проверяем, существует ли продукт "Кастомный дизайн"
      let customProduct = await prisma.product.findFirst({
        where: { name: "Кастомный дизайн" },
      });

      // Если нет, создаем новый продукт "Кастомный дизайн"
      if (!customProduct) {
        customProduct = await prisma.product.create({
          data: {
            name: "Кастомный дизайн",
            imageUrl: data.customDesignUrl,
            category: {
              connectOrCreate: {
                where: { name: "Кастомные товары" },
                create: { name: "Кастомные товары" },
              },
            },
          },
        });
      }
      else {
        customProduct = await prisma.product.create({
          data: {
            name: "Кастомный дизайн",
            imageUrl: data.customDesignUrl,
            category: {
              connectOrCreate: {
                where: { name: "Кастомные товары" },
                create: { name: "Кастомные товары" },
              },
            },
          },
        });
      }



      // Создаем новый ProductItem с кастомным изображением
      const productItem = await prisma.productItem.create({
        data: {
          price: data.price || 1500, // Цена за кастомный дизайн
          productId: customProduct.id,
          size: null,
          pizzaType: null,
        },
      });

      // Добавляем созданный ProductItem в корзину
      await prisma.cartItem.create({
        data: {
          cartId: userCart.id,
          productItemId: productItem.id,
          quantity: 1,
          ingredients: {
            connect: [], // Кастомный дизайн без ингредиентов
          },
        },
      });

      const updatedUserCart = await updateCartTotalAmount(token);
      const resp = NextResponse.json(updatedUserCart);
      resp.cookies.set('cartToken', token);
      return resp;
    }

    // ✅ Добавление обычного товара (пицца и т.д.)
    const findCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: userCart.id,
        productItemId: data.productItemId,
        ingredients: {
          every: {
            id: { in: data.ingredients || [] },
          },
        },
      },
    });

    // Если товар был найден, увеличиваем количество
    if (findCartItem) {
      await prisma.cartItem.update({
        where: {
          id: findCartItem.id,
        },
        data: {
          quantity: findCartItem.quantity + 1,
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: userCart.id,
          productItemId: data.productItemId!,
          quantity: 1,
          ingredients: { connect: data.ingredients?.map((id) => ({ id })) || [] },
        },
      });
    }

    const updatedUserCart = await updateCartTotalAmount(token);

    const resp = NextResponse.json(updatedUserCart);
    resp.cookies.set('cartToken', token);
    return resp;
  } catch (error) {
    console.error('[CART_POST] Server error', error);
    return NextResponse.json({ message: 'Не удалось создать корзину' }, { status: 500 });
  }
}
