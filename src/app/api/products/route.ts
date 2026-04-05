import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { getAllProducts, getFeaturedProducts, searchProducts, createProduct } from '@/lib/db-supabase';
import { sanitizeInput } from '@/lib/utils';
import type { SizeType } from '@/lib/types';

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('hm_token')?.value;
  if (!token) return false;
  const payload = await verifyToken(token);
  return payload?.role === 'admin';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const catalogId = searchParams.get('catalogId') || '';
  const featured = searchParams.get('featured') === 'true';

  let products;
  if (featured) {
    products = await getFeaturedProducts();
  } else if (q || catalogId) {
    products = await searchProducts(q, catalogId || undefined);
  } else {
    products = await getAllProducts();
  }
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  try {
    const body = await request.json();
    const name = sanitizeInput(body.name || '');
    if (!name) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });

    const product = await createProduct({
      catalogId: body.catalogId || '',
      name,
      description: sanitizeInput(body.description || ''),
      price: Number(body.price) || 0,
      imageUrl: sanitizeInput(body.imageUrl || ''),
      featured: Boolean(body.featured),
      stock: Number(body.stock) || 0,
      sizeType: (body.sizeType || 'none') as SizeType,
      customSizeOptions: Array.isArray(body.customSizeOptions) ? body.customSizeOptions : [],
    });
    return NextResponse.json(product, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
