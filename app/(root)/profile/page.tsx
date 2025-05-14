import { prisma } from '@/prisma/prisma-client';
import { ProfileForm } from '@/shared/components';
import { getUserSession } from '@/shared/lib/get-user-session';
import { redirect } from 'next/navigation';
import { ProfileOrders } from '@/shared/components/shared';
import { Container } from '@/shared/components/shared';
export default async function ProfilePage() {
  const session = await getUserSession();

  if (!session) {
    return redirect('/not-auth');
  }

  const user = await prisma.user.findFirst({ where: { id: Number(session?.id) } });

  if (!user) {
    return redirect('/not-auth');
  }

     const orders = await prisma.order.findMany({
    where: {
      email: session.email,
    },
    orderBy: {
      createdAt: 'desc',
    },

  });

const formattedOrders = orders.map((order) => ({
    ...order,
    createdAt: order.createdAt.toISOString(),
  }));

  return(<Container className='flex flex-col'> 
  <div>
    <ProfileForm data={user} />
    </div>
  <div>
    <ProfileOrders orders={formattedOrders} />
  </div>
  </Container>
  );
}
