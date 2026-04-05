'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartSidebar from '@/components/CartSidebar';
import CheckoutModal from '@/components/CheckoutModal';
import type { Catalog } from '@/lib/types';
import styles from './page.module.css';

export default function CatalogPage() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    fetch('/api/catalogs').then((r) => r.json()).then((data) => {
      setCatalogs(data);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <Navbar />
      <CartSidebar onCheckout={() => setCheckoutOpen(true)} />
      {checkoutOpen && <CheckoutModal onClose={() => setCheckoutOpen(false)} />}

      <main className={styles.main}>
        <div className="container">
          <div className={styles.header}>
            <h1 className="section-title">Todos los Catálogos</h1>
            <p className="section-subtitle">Explora nuestras categorías de productos</p>
          </div>
          <div className={styles.grid}>
            {loading
              ? Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ aspectRatio: '1', borderRadius: '20px' }} />)
              : catalogs.map((catalog) => (
                  <Link key={catalog.id} href={`/catalogo/${catalog.slug}`} className={styles.card} id={`catalog-${catalog.slug}`}>
                    <div className={styles.imgWrap}>
                      <Image src={catalog.imageUrl} alt={catalog.name} fill sizes="400px" className={styles.img} unoptimized />
                      <div className={styles.overlay}>
                        <h2>{catalog.name}</h2>
                        <p>{catalog.description}</p>
                        <span className={styles.cta}>Explorar →</span>
                      </div>
                    </div>
                  </Link>
                ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
