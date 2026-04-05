// ============================================================
// AUTH UTILITIES — HogarModa
// JWT firmado con jose (compatible con Edge Runtime de Next.js)
// ============================================================

import { SignJWT, jwtVerify } from 'jose';
import type { JwtPayload } from './types';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'hogarmoda-secret-key-change-in-production'
);

const EXPIRES_IN = '7d';

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}
