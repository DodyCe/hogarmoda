import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { signToken, verifyToken } from '@/lib/auth';
import { findUserByEmail, ensureAdminExists } from '@/lib/db-supabase';
import { sanitizeInput } from '@/lib/utils';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await ensureAdminExists();
    const { email, password } = await request.json();
    const cleanEmail = sanitizeInput(email || '').toLowerCase();

    if (!cleanEmail || !password) return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 });

    const user = await findUserByEmail(cleanEmail);
    if (!user) return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });

    const valid = bcrypt.compareSync(password, user.passwordHash);
    if (!valid) return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });

    const token = await signToken({ userId: user.id, email: user.email, role: user.role, name: user.name });

    const cookieStore = await cookies();
    cookieStore.set('hm_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message || 'Error interno' }, { status: 500 });
  }
}
