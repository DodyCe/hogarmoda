'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { formatCOP } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import SizePicker from './SizePicker';
import styles from './ProductCard.module.css';

interface Props {
  product: Product;
}

const SIZE_TYPE_BADGE: Record<string, string> = {
  shoes: '👟 Tallas disponibles',
  curtains: '📐 Medida a elegir',
  accessories: '💍 Accesorios',
};

export default function ProductCard({ product }: Props) {
  const { addItem } = useCart();
  const [showPicker, setShowPicker] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (product.sizeType !== 'none') {
      setShowPicker(true);
    } else {
      addItem(product);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    }
  };

  const handleSizeConfirm = (size: string) => {
    addItem(product, size);
    setShowPicker(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <>
      {showPicker && (
        <SizePicker
          product={product}
          onConfirm={handleSizeConfirm}
          onCancel={() => setShowPicker(false)}
        />
      )}

      <div className={styles.card} id={`product-${product.id}`}>
        <Link href={`/producto/${product.id}`} className={styles.imageWrapper}>
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 300px"
            className={styles.image}
            unoptimized
          />
          {product.featured && <span className={styles.featured}>⭐ Destacado</span>}
          {product.sizeType !== 'none' && (
            <span className={styles.sizeBadge}>{SIZE_TYPE_BADGE[product.sizeType]}</span>
          )}
        </Link>
        <div className={styles.body}>
          <Link href={`/producto/${product.id}`}>
            <h3 className={styles.name}>{product.name}</h3>
          </Link>
          <p className={styles.description}>{product.description.slice(0, 80)}…</p>
          <div className={styles.footer}>
            <span className={styles.price}>{formatCOP(product.price)}</span>
            <button
              className={`${styles.addBtn} ${added ? styles.addedBtn : ''}`}
              onClick={handleAdd}
              aria-label={`Agregar ${product.name} al carrito`}
              id={`add-to-cart-${product.id}`}
            >
              {added ? '✅' : '🛒 Agregar'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
