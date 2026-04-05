'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartSidebar from '@/components/CartSidebar';
import CheckoutModal from '@/components/CheckoutModal';
import ProductCard from '@/components/ProductCard';
import type { Product, Catalog } from '@/lib/types';
import styles from './page.module.css';

export default function CatalogSlugPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/catalogs').then((r) => r.json()),
      fetch('/api/products').then((r) => r.json()),
    ]).then(([cats, prods]: [Catalog[], Product[]]) => {
      const found = cats.find((c) => c.slug === slug);
      setCatalog(found || null);
      if (found) setProducts(prods.filter((p) => p.catalogId === found.id));
      setLoading(false);
    });
  }, [slug]);

  return (
    <>
      <Navbar />
      <CartSidebar onCheckout={() => setCheckoutOpen(true)} />
      {checkoutOpen && <CheckoutModal onClose={() => setCheckoutOpen(false)} />}

      <main className={styles.main}>
        <div className="container">
          {loading ? (
            <div className={styles.loading}>
              <div className="skeleton" style={{ height: 32, width: 200, borderRadius: 8, marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 20, width: 300, borderRadius: 8 }} />
            </div>
          ) : !catalog ? (
            <div className={styles.notFound}>
              <span>😕</span>
              <h2>Catálogo no encontrado</h2>
              <p>El catálogo que buscas no existe.</p>
            </div>
          ) : (
            <>
              <div className={styles.header}>
                <h1 className="section-title">{catalog.name}</h1>
                <p className="section-subtitle">{catalog.description}</p>
                <span className={styles.count}>{products.length} productos</span>
              </div>
              {products.length === 0 ? (
                <div className={styles.empty}>
                  <span>📦</span>
                  <p>No hay productos en este catálogo aún.</p>
                </div>
              ) : (
                <div className="product-grid">
                  {products.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
