import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { getAllCatalogs, createCatalog } from '@/lib/db-supabase';
import { sanitizeInput } from '@/lib/utils';

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('hm_token')?.value;
  if (!token) return false;
  const payload = await verifyToken(token);
  return payload?.role === 'admin';
}

export async function GET() {
  const catalogs = await getAllCatalogs();
  return NextResponse.json(catalogs);
}

export async function POST(request: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  try {
    const body = await request.json();
    const name = sanitizeInput(body.name || '');
    if (!name) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });

    const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const catalog = await createCatalog({
      name,
      slug: sanitizeInput(body.slug || slug),
      description: sanitizeInput(body.description || ''),
      imageUrl: sanitizeInput(body.imageUrl || ''),
      order: Number(body.order) || 99,
    });
    return NextResponse.json(catalog, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
