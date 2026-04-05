'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartSidebar from '@/components/CartSidebar';
import CheckoutModal from '@/components/CheckoutModal';
import type { Product, Catalog } from '@/lib/types';
import { formatCOP } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import SizePicker from '@/components/SizePicker';
import styles from './page.module.css';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${id}`).then((r) => {
      if (!r.ok) { setLoading(false); return null; }
      return r.json();
    }).then(async (prod) => {
      if (!prod) { setLoading(false); return; }
      setProduct(prod);
      const cats: Catalog[] = await fetch('/api/catalogs').then((r) => r.json());
      setCatalog(cats.find((c) => c.id === prod.catalogId) || null);
      setLoading(false);
    });
  }, [id]);

  const handleAdd = () => {
    if (!product) return;
    if (product.sizeType !== 'none') {
      setShowSizePicker(true);
    } else {
      addItem(product);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleSizeConfirm = (size: string) => {
    if (!product) return;
    addItem(product, size);
    setShowSizePicker(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return (
    <>
      <Navbar />
      <div className={styles.loadingPage}>
        <div className={styles.skeletonImg} />
        <div className={styles.skeletonInfo}>
          {[200, 100, 300, 80].map((w, i) => (
            <div key={i} className="skeleton" style={{ height: i === 0 ? 36 : 20, width: w, borderRadius: 8 }} />
          ))}
        </div>
      </div>
    </>
  );

  if (!product) return (
    <>
      <Navbar />
      <div className={styles.notFound}>
        <span>😕</span><h2>Producto no encontrado</h2>
        <Link href="/buscar" className="btn btn-primary">Explorar productos</Link>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <CartSidebar onCheckout={() => setCheckoutOpen(true)} />
      {checkoutOpen && <CheckoutModal onClose={() => setCheckoutOpen(false)} />}

      {showSizePicker && product && (
        <SizePicker
          product={product}
          onConfirm={handleSizeConfirm}
          onCancel={() => setShowSizePicker(false)}
        />
      )}

      <main className={styles.main}>
        <div className="container">
          <div className={styles.breadcrumb}>
            <Link href="/">Inicio</Link>
            <span>›</span>
            {catalog && <Link href={`/catalogo/${catalog.slug}`}>{catalog.name}</Link>}
            <span>›</span>
            <span>{product.name}</span>
          </div>

          <div className={styles.product}>
            <div className={styles.imageSection}>
              <div className={styles.imgWrap}>
                <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className={styles.img} unoptimized />
                {product.featured && <span className={styles.featuredBadge}>⭐ Destacado</span>}
              </div>
            </div>

            <div className={styles.info}>
              {catalog && (
                <Link href={`/catalogo/${catalog.slug}`} className={styles.catalogTag}>{catalog.name}</Link>
              )}
              <h1 className={styles.name}>{product.name}</h1>
              <div className={styles.price}>{formatCOP(product.price)}</div>
              <p className={styles.desc}>{product.description}</p>

              <div className={styles.deliveryBox}>
                <span>📦</span>
                <div>
                  <strong>Contraentrega</strong>
                  <p>Paga cuando recibas tu pedido</p>
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  className={`btn btn-primary btn-lg ${styles.addBtn}`}
                  onClick={handleAdd}
                  id={`detail-add-${product.id}`}
                >
                  {added ? '✅ ¡Agregado!' : '🛒 Agregar al carrito'}
                </button>
                <a
                  href={`https://wa.me/573165517051?text=Hola%2C%20me%20interesa%20el%20producto%3A%20${encodeURIComponent(product.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-lg"
                >
                  💬 Consultar
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
