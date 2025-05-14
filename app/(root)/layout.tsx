import { Header } from '@/shared/components/shared';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Sawert Shop | Магазин футболок',
  description: 'Sawert Shop это магазин футболок. Здесь можно купить себе футболки разного размера от S до 4XL а также создать свой дизайн с помощью ИИ моделей',
};

export default function HomeLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen">
      <Suspense>
        <Header />
      </Suspense>
      {children}
      {modal}
    </main>
  );
}
