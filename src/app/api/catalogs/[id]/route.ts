import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { getCatalogById, updateCatalog, deleteCatalog } from '@/lib/db-supabase';
import { sanitizeInput } from '@/lib/utils';

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('hm_token')?.value;
  if (!token) return false;
  const payload = await verifyToken(token);
  return payload?.role === 'admin';
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  const { id } = await params;
  try {
    const body = await request.json();
    const updated = await updateCatalog(id, {
      name: sanitizeInput(body.name),
      description: sanitizeInput(body.description || ''),
      imageUrl: sanitizeInput(body.imageUrl || ''),
      order: Number(body.order) || 99,
    });
    if (!updated) return NextResponse.json({ error: 'Catálogo no encontrado' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  const { id } = await params;
  const ok = await deleteCatalog(id);
  if (!ok) return NextResponse.json({ error: 'No se pudo eliminar' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
