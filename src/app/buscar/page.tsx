'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartSidebar from '@/components/CartSidebar';
import CheckoutModal from '@/components/CheckoutModal';
import ProductCard from '@/components/ProductCard';
import type { Product, Catalog } from '@/lib/types';
import styles from './page.module.css';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [catalogFilter, setCatalogFilter] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    fetch('/api/catalogs').then((r) => r.json()).then(setCatalogs);
    fetch('/api/products').then((r) => r.json()).then((data) => {
      setProducts(data);
      setSearched(true);
    });
  }, []);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (catalogFilter) params.set('catalogId', catalogFilter);
    const data = await fetch(`/api/products?${params}`).then((r) => r.json());
    setProducts(data);
    setLoading(false);
    setSearched(true);
  }, [query, catalogFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query || catalogFilter) handleSearch();
    }, 400);
    return () => clearTimeout(timer);
  }, [query, catalogFilter, handleSearch]);

  return (
    <>
      <Navbar />
      <CartSidebar onCheckout={() => setCheckoutOpen(true)} />
      {checkoutOpen && <CheckoutModal onClose={() => setCheckoutOpen(false)} />}

      <main className={styles.main}>
        <div className="container">
          <h1 className="section-title" style={{ marginBottom: 8 }}>Buscar Productos</h1>
          <p className="section-subtitle" style={{ marginBottom: 32 }}>Encuentra lo que necesitas</p>

          <div className={styles.filters}>
            <div className={styles.searchBar}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                className={styles.searchInput}
                type="search"
                placeholder="Buscar sábanas, cortinas, zapatos…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                id="search-input"
              />
              {query && (
                <button className={styles.clearBtn} onClick={() => setQuery('')}>✕</button>
              )}
            </div>
            <select
              className={styles.select}
              value={catalogFilter}
              onChange={(e) => setCatalogFilter(e.target.value)}
              id="catalog-filter"
            >
              <option value="">Todas las categorías</option>
              {catalogs.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {searched && (
            <p className={styles.resultCount}>
              {loading ? 'Buscando…' : `${products.length} producto${products.length !== 1 ? 's' : ''} encontrado${products.length !== 1 ? 's' : ''}`}
            </p>
          )}

          {loading ? (
            <div className="product-grid">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="skeleton" style={{ aspectRatio: '3/4', borderRadius: 20 }} />
              ))}
            </div>
          ) : products.length === 0 && searched ? (
            <div className={styles.empty}>
              <span>🔍</span>
              <h2>Sin resultados</h2>
              <p>Intenta con otras palabras clave o explora los catálogos</p>
            </div>
          ) : (
            <div className="product-grid">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
