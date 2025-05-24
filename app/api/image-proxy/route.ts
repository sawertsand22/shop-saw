// app/api/image-proxy/route.ts (если App Router)
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return new Response('Missing url param', { status: 400 });

  const imageRes = await fetch(url);
  const buffer = await imageRes.arrayBuffer();

  return new Response(buffer, {
    headers: {
      'Content-Type': imageRes.headers.get('content-type') || 'image/png',
      'Cache-Control': 'no-store',
    },
  });
}
