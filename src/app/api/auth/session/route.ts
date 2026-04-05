import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { findUserById } from '@/lib/db-supabase';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('hm_token')?.value;
    if (!token) return NextResponse.json(null);

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json(null);

    const user = await findUserById(payload.sub);
    if (!user) return NextResponse.json(null);

    return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch {
    return NextResponse.json(null);
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('hm_token');
  return NextResponse.json({ ok: true });
}
