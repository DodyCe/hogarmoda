'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { formatCOP } from '@/lib/utils';
import styles from './CartSidebar.module.css';

interface Props {
  onCheckout: () => void;
}

export default function CartSidebar({ onCheckout }: Props) {
  const { items, total, isOpen, closeCart, removeItem, updateQuantity } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <div className="overlay" onClick={closeCart} />
      <aside className={styles.sidebar} id="cart-sidebar">
        <div className={styles.header}>
          <h2 className={styles.title}>🛒 Tu Carrito</h2>
          <button className={styles.closeBtn} onClick={closeCart} aria-label="Cerrar carrito">✕</button>
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🛍️</span>
            <p>Tu carrito está vacío</p>
            <button className="btn btn-primary" onClick={closeCart}>Explorar productos</button>
          </div>
        ) : (
          <>
            <div className={styles.items}>
              {items.map((item) => (
                <div key={`${item.productId}-${item.selectedSize || 'none'}`} className={styles.item}>
                  <div className={styles.itemInitial}>
                    {item.name.charAt(0)}
                  </div>
                  <div className={styles.itemInfo}>
                    <p className={styles.itemName}>{item.name}</p>
                    {item.selectedSize && (
                      <span className={styles.itemSize}>
                        📏 {item.selectedSize}
                      </span>
                    )}
                    <p className={styles.itemPrice}>{formatCOP(item.price)}</p>
                    <div className={styles.qty}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedSize)}
                        aria-label="Reducir cantidad"
                      >−</button>
                      <span className={styles.qtyNum}>{item.quantity}</span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedSize)}
                        aria-label="Aumentar cantidad"
                      >+</button>
                    </div>
                  </div>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeItem(item.productId, item.selectedSize)}
                    aria-label="Eliminar producto"
                  >🗑️</button>
                </div>
              ))}
            </div>

            <div className={styles.footer}>
              <div className={styles.totalRow}>
                <span>Total</span>
                <strong className={styles.total}>{formatCOP(total)}</strong>
              </div>
              <p className={styles.delivery}>📦 Envío contraentrega</p>
              <button
                className={`btn btn-primary ${styles.checkoutBtn}`}
                onClick={() => { closeCart(); onCheckout(); }}
                id="checkout-button"
              >
                Confirmar Pedido →
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
