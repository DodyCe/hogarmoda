'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className={`container ${styles.inner}`}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>🏠</span>
            <span>Hogar<strong>Moda</strong></span>
          </Link>

          <div className={styles.navLinks}>
            <Link href="/" className={styles.link}>Inicio</Link>
            <Link href="/catalogo" className={styles.link}>Catálogos</Link>
            <Link href="/buscar" className={styles.link}>Buscar</Link>
            {user && <Link href="/mis-pedidos" className={styles.link}>Mis Pedidos</Link>}
          </div>

          <div className={styles.actions}>
            <button
              className={styles.cartBtn}
              onClick={openCart}
              aria-label="Abrir carrito"
              id="cart-button"
            >
              🛒
              {count > 0 && <span className={styles.badge}>{count}</span>}
            </button>

            {user ? (
              <div className={styles.userMenu}>
                <span className={styles.userName}>Hola, {user.name.split(' ')[0]}</span>
                {user.role === 'admin' && (
                  <Link href="/admin" className="btn btn-primary btn-sm">Admin</Link>
                )}
                <button className="btn btn-ghost btn-sm" onClick={logout}>Salir</button>
              </div>
            ) : (
              <div className={styles.authBtns}>
                <Link href="/login" className="btn btn-ghost btn-sm">Ingresar</Link>
                <Link href="/registro" className="btn btn-primary btn-sm">Registrarse</Link>
              </div>
            )}

            <button
              className={styles.menuBtn}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menú"
              id="mobile-menu-button"
            >
              <span className={`${styles.bar} ${menuOpen ? styles.open1 : ''}`} />
              <span className={`${styles.bar} ${menuOpen ? styles.open2 : ''}`} />
              <span className={`${styles.bar} ${menuOpen ? styles.open3 : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link href="/" onClick={() => setMenuOpen(false)}>Inicio</Link>
          <Link href="/catalogo" onClick={() => setMenuOpen(false)}>Catálogos</Link>
          <Link href="/buscar" onClick={() => setMenuOpen(false)}>Buscar</Link>
          {user && <Link href="/mis-pedidos" onClick={() => setMenuOpen(false)}>Mis Pedidos</Link>}
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link href="/admin" onClick={() => setMenuOpen(false)}>Panel Admin</Link>
              )}
              <button onClick={() => { logout(); setMenuOpen(false); }}>Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)}>Ingresar</Link>
              <Link href="/registro" onClick={() => setMenuOpen(false)}>Registrarse</Link>
            </>
          )}
        </div>
      )}
    </>
  );
}
