'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './auth.module.css';

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (user) {
    if (user.role === 'admin') router.replace('/admin');
    else router.replace('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(form.email.trim(), form.password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      const params = new URLSearchParams(window.location.search);
      router.replace(params.get('redirect') || '/');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo}>🏠 Livende</Link>
        <h1 className={styles.title}>Iniciar sesión</h1>
        <p className={styles.sub}>Bienvenido de nuevo</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className="form-group">
            <label className="form-label">Correo electrónico o usuario</label>
            <input
              className="form-input"
              type="text"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="correo@ejemplo.com"
              autoFocus
              id="login-email"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Tu contraseña"
                id="login-password"
                required
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', opacity: 0.6 }}
                tabIndex={-1}
              >
                {showPassword ? '🫣' : '👁️'}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading} id="login-submit">
            {loading ? 'Ingresando…' : 'Ingresar →'}
          </button>
        </form>

        <p className={styles.switchLink}>
          ¿No tienes cuenta? <Link href="/registro">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
}
