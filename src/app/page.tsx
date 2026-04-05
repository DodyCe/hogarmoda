'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartSidebar from '@/components/CartSidebar';
import CheckoutModal from '@/components/CheckoutModal';
import ProductCard from '@/components/ProductCard';
import type { Product, Catalog } from '@/lib/types';
import styles from './page.module.css';

export default function HomePage() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/catalogs').then((r) => r.json()),
      fetch('/api/products?featured=true').then((r) => r.json()),
    ]).then(([cats, prods]) => {
      setCatalogs(cats);
      setFeatured(prods);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <Navbar />
      <CartSidebar onCheckout={() => setCheckoutOpen(true)} />
      {checkoutOpen && <CheckoutModal onClose={() => setCheckoutOpen(false)} />}

      <main>
        {/* ── Hero ── */}
        <section className={styles.hero}>
          <div className={styles.heroBg} />
          <div className={`container ${styles.heroContent}`}>
            <span className={styles.heroBadge}>✨ Nuevas colecciones 2025</span>
            <h1 className={styles.heroTitle}>
              Tu hogar merece<br />
              <span className={styles.heroAccent}>lo mejor</span>
            </h1>
            <p className={styles.heroSub}>
              Sábanas, cortinas, zapatos y más — entregados a tu puerta en todo Colombia.
              Pedidos 100% contraentrega.
            </p>
            <div className={styles.heroActions}>
              <Link href="/catalogo" className="btn btn-primary btn-lg">
                Ver catálogos 🛍️
              </Link>
              <a
                href="https://wa.me/573165517051"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-lg"
              >
                💬 Consultar
              </a>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.stat}><strong>100%</strong><span>Contraentrega</span></div>
              <div className={styles.statDiv} />
              <div className={styles.stat}><strong>📱</strong><span>Pedido por WhatsApp</span></div>
              <div className={styles.statDiv} />
              <div className={styles.stat}><strong>🇨🇴</strong><span>Colombia</span></div>
            </div>
          </div>
        </section>

        {/* ── Catalogs ── */}
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHead}>
              <div>
                <h2 className="section-title">Nuestros Catálogos</h2>
                <p className="section-subtitle">Explora nuestra selección de productos para tu hogar y estilo</p>
              </div>
              <Link href="/catalogo" className="btn btn-secondary">Ver todos →</Link>
            </div>
            <div className="catalog-grid">
              {loading
                ? Array(4).fill(0).map((_, i) => (
                    <div key={i} className={`skeleton ${styles.catSkeleton}`} />
                  ))
                : catalogs.map((catalog) => (
                    <Link key={catalog.id} href={`/catalogo/${catalog.slug}`} className={styles.catalogCard}>
                      <div className={styles.catalogImg}>
                        <Image
                          src={catalog.imageUrl}
                          alt={catalog.name}
                          fill
                          sizes="280px"
                          className={styles.catalogImage}
                          unoptimized
                        />
                        <div className={styles.catalogOverlay} />
                      </div>
                      <div className={styles.catalogInfo}>
                        <h3>{catalog.name}</h3>
                        <p>{catalog.description}</p>
                        <span className={styles.catalogLink}>Explorar →</span>
                      </div>
                    </Link>
                  ))}
            </div>
          </div>
        </section>

        {/* ── Featured Products ── */}
        <section className={`${styles.section} ${styles.featuredSection}`}>
          <div className="container">
            <div className={styles.sectionHead}>
              <div>
                <h2 className="section-title">Productos Destacados</h2>
                <p className="section-subtitle">Los favoritos de nuestros clientes</p>
              </div>
              <Link href="/buscar" className="btn btn-secondary">Ver todo →</Link>
            </div>
            <div className="product-grid">
              {loading
                ? Array(4).fill(0).map((_, i) => (
                    <div key={i} className={`skeleton ${styles.productSkeleton}`} />
                  ))
                : featured.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className={`${styles.section} ${styles.howSection}`}>
          <div className="container">
            <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '8px' }}>¿Cómo funciona?</h2>
            <p className="section-subtitle" style={{ textAlign: 'center', marginBottom: '48px' }}>Comprar es fácil y seguro</p>
            <div className={styles.steps}>
              {[
                { icon: '🛍️', title: 'Elige tus productos', desc: 'Navega por catálogos y agrega al carrito' },
                { icon: '📝', title: 'Ingresa tus datos', desc: 'Nombre, teléfono y dirección de entrega' },
                { icon: '📲', title: 'Confirma por WhatsApp', desc: 'Tu pedido llega directo al vendedor' },
                { icon: '🚚', title: 'Recibe en casa', desc: 'Pago contra entrega, sin adelantos' },
              ].map((step, i) => (
                <div key={i} className={styles.step}>
                  <div className={styles.stepIcon}>{step.icon}</div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
