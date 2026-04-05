import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { getOrderById, updateOrderStatus } from '@/lib/db-supabase';
import type { Order } from '@/lib/types';

async function getAuthPayload() {
  const cookieStore = await cookies();
  const token = cookieStore.get('hm_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

const VALID_STATUSES: Order['status'][] = ['pending','confirmed','shipped','delivered','cancelled'];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getAuthPayload();
  if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
  try {
    const { status } = await request.json();
    if (!VALID_STATUSES.includes(status)) return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
    const updated = await updateOrderStatus(id, status);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getAuthPayload();
  if (!payload) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
  if (payload.role !== 'admin' && order.userId !== payload.sub) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  return NextResponse.json(order);
}
