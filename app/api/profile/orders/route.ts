import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/shared/constants/auth-options';
import { prisma } from '@/prisma/prisma-client';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: {
      email: session.user.email,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return NextResponse.json(orders);
}
