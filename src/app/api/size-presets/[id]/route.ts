import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { updateSizePreset, deleteSizePreset } from '@/lib/db-supabase';

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
    const { label, value, order } = await request.json();
    const updated = await updateSizePreset(id, { label, value, order: Number(order) });
    if (!updated) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  const { id } = await params;
  const ok = await deleteSizePreset(id);
  if (!ok) return NextResponse.json({ error: 'No se pudo eliminar' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
