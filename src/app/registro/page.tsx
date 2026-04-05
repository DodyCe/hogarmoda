'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from '../login/auth.module.css';

export default function RegisterPage() {
  const { register, user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (user) { router.replace('/'); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Las contraseñas no coinciden'); return; }
    setLoading(true);
    const result = await register(form.name.trim(), form.email.trim(), form.password);
    setLoading(false);
    if (result.error) setError(result.error);
    else router.replace('/');
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo}>🏠 Livende</Link>
        <h1 className={styles.title}>Crear cuenta</h1>
        <p className={styles.sub}>Únete y empieza a comprar</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className="form-group">
            <label className="form-label">Nombre completo</label>
            <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tu nombre" id="register-name" required />
          </div>
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="correo@ejemplo.com" id="register-email" required />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input className="form-input" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 6 caracteres" id="register-password" required minLength={6} style={{ paddingRight: '40px' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', opacity: 0.6 }} tabIndex={-1}>{showPassword ? '🫣' : '👁️'}</button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Confirmar contraseña</label>
            <div style={{ position: 'relative' }}>
              <input className="form-input" type={showPassword ? 'text' : 'password'} value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="Repite tu contraseña" id="register-confirm" required style={{ paddingRight: '40px' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', opacity: 0.6 }} tabIndex={-1}>{showPassword ? '🫣' : '👁️'}</button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading} id="register-submit">
            {loading ? 'Creando cuenta…' : 'Crear cuenta →'}
          </button>
        </form>

        <p className={styles.switchLink}>
          ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
