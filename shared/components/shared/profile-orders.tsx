import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { OrderStatus, Prisma } from '@prisma/client';
import Image from 'next/image';
import { cn } from '@/shared/lib/utils';

type Props = {
  orders: {
    id: number;
    createdAt: string;
    totalAmount: number;
    status: OrderStatus;
    items: Prisma.JsonValue;
  }[];
};

export const ProfileOrders: React.FC<Props> = ({ orders }) => {
  if (!orders.length) {
    return <p className="text-muted-foreground">У вас пока нет заказов.</p>;
  }

  return (
    <div className="space-y-6 mt-8">
      <h2 className="text-2xl font-bold mb-4">История заказов</h2>
      <div className="space-y-6">
        {orders.map((order) => {
          let parsedItems: any[] = [];

          if (typeof order.items === 'string') {
            try {
              parsedItems = JSON.parse(order.items);
            } catch (error) {
              console.error('Ошибка при парсинге JSON:', error);
            }
          } else if (Array.isArray(order.items)) {
            parsedItems = order.items;
          }

          return (
            <Card key={order.id} className="shadow-lg border border-gray-200">
              <CardHeader className="bg-gray-100 p-4 flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Заказ #{order.id}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Дата: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm">Сумма: <span className="font-bold">{order.totalAmount} ₽</span></p>
                  <p className="text-sm">Статус: <span className="font-medium">{order.status}</span></p>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold text-lg">Товары в заказе:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {parsedItems.length > 0 ? (
                    parsedItems.map((item: any, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="w-20 h-20 relative">
                          <Image
  src={item.productItem?.product?.imageUrl || '/placeholder-image.png'}
  alt={item.productItem?.product?.name || 'Товар'}
  fill
  className="rounded-md object-cover"
/>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">
                            {item.productItem?.product?.name || 'Неизвестный товар'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} шт. × {item.productItem?.price} ₽
                          </p>
                          <p className="text-sm font-semibold">
                            Итого: {item.quantity * item.productItem?.price} ₽
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">Нет данных о товарах.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
