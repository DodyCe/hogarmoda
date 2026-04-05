import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <div className={styles.logo}>🏠 Hogar<strong>Moda</strong></div>
          <p>Tu tienda de hogar y moda con entrega contraentrega en toda Colombia.</p>
          <a
            href="https://wa.me/573165517051"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.waBtn}
          >
            💬 Hablar con el vendedor
          </a>
        </div>

        <div className={styles.links}>
          <div className={styles.col}>
            <h4>Catálogos</h4>
            <Link href="/catalogo/ropa-de-cama">Ropa de Cama</Link>
            <Link href="/catalogo/cortinas">Cortinas</Link>
            <Link href="/catalogo/zapatos">Zapatos</Link>
            <Link href="/catalogo/hogar">Hogar</Link>
          </div>
          <div className={styles.col}>
            <h4>Cuenta</h4>
            <Link href="/login">Iniciar sesión</Link>
            <Link href="/registro">Registrarse</Link>
            <Link href="/buscar">Buscar productos</Link>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} HogarModa. Todos los derechos reservados.</p>
        <p>📞 WhatsApp: +57 316 551 7051 · Entregas contraentrega en Colombia</p>
      </div>
    </footer>
  );
}
