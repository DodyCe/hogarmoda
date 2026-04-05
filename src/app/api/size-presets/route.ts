import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { getSizePresets, createSizePreset } from '@/lib/db-supabase';
import type { SizeType } from '@/lib/types';

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('hm_token')?.value;
  if (!token) return false;
  const payload = await verifyToken(token);
  return payload?.role === 'admin';
}

// GET /api/size-presets?type=shoes|curtains|accessories
export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type') as SizeType | null;
  const presets = await getSizePresets(type || undefined);
  return NextResponse.json(presets);
}

// POST /api/size-presets — admin only
export async function POST(request: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  try {
    const { sizeType, label, value, order } = await request.json();
    if (!sizeType || !label || !value) return NextResponse.json({ error: 'sizeType, label y value son requeridos' }, { status: 400 });
    const preset = await createSizePreset({ sizeType, label, value, order: Number(order) || 99 });
    return NextResponse.json(preset, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
