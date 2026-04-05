import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { findUserByEmail, createUser, ensureAdminExists } from '@/lib/db-supabase';
import { sanitizeInput } from '@/lib/utils';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await ensureAdminExists();
    const { name, email, password } = await request.json();
    const cleanName = sanitizeInput(name || '');
    const cleanEmail = sanitizeInput(email || '').toLowerCase();

    if (!cleanName || cleanName.length < 2) return NextResponse.json({ error: 'Nombre muy corto' }, { status: 400 });
    if (!cleanEmail || !cleanEmail.includes('@')) return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    if (!password || password.length < 6) return NextResponse.json({ error: 'Contraseña mínimo 6 caracteres' }, { status: 400 });

    const existing = await findUserByEmail(cleanEmail);
    if (existing) return NextResponse.json({ error: 'Este email ya está registrado' }, { status: 409 });

    const passwordHash = bcrypt.hashSync(password, 10);
    const user = await createUser(cleanName, cleanEmail, passwordHash);

    return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role }, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message || 'Error interno' }, { status: 500 });
  }
}
