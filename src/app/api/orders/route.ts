import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { getAllOrders, createOrder, getOrdersByUser } from '@/lib/db-supabase';
import { sanitizeInput } from '@/lib/utils';

async function getAuthPayload() {
  const cookieStore = await cookies();
  const token = cookieStore.get('hm_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET() {
  const payload = await getAuthPayload();
  if (!payload) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  if (payload.role === 'admin') return NextResponse.json(await getAllOrders());
  return NextResponse.json(await getOrdersByUser(payload.userId));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = await getAuthPayload();

    const customerName = sanitizeInput(body.customerName || '');
    const phone = sanitizeInput(body.phone || '');
    const address = sanitizeInput(body.address || '');
    const notes = sanitizeInput(body.notes || '');
    const items = body.items;
    const total = body.total;

    if (!customerName || !phone || !address)
      return NextResponse.json({ error: 'Nombre, teléfono y dirección son requeridos' }, { status: 400 });
    if (!Array.isArray(items) || items.length === 0)
      return NextResponse.json({ error: 'El pedido debe tener al menos un producto' }, { status: 400 });

    const order = await createOrder({
      userId: payload?.userId,
      customerName, phone, address, notes,
      items,
      total: Number(total),
    });
    return NextResponse.json(order, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message || 'Error interno' }, { status: 500 });
  }
}
