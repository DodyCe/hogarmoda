import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { getProductById, updateProduct, deleteProduct } from '@/lib/db-supabase';
import { sanitizeInput } from '@/lib/utils';
import type { SizeType } from '@/lib/types';

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('hm_token')?.value;
  if (!token) return false;
  const payload = await verifyToken(token);
  return payload?.role === 'admin';
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  const { id } = await params;
  try {
    const body = await request.json();
    const updated = await updateProduct(id, {
      name: sanitizeInput(body.name),
      description: sanitizeInput(body.description || ''),
      price: Number(body.price),
      imageUrl: sanitizeInput(body.imageUrl || ''),
      featured: Boolean(body.featured),
      stock: Number(body.stock) || 0,
      catalogId: body.catalogId || '',
      sizeType: (body.sizeType || 'none') as SizeType,
      customSizeOptions: Array.isArray(body.customSizeOptions) ? body.customSizeOptions : [],
    });
    if (!updated) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  const { id } = await params;
  const ok = await deleteProduct(id);
  if (!ok) return NextResponse.json({ error: 'No se pudo eliminar' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
