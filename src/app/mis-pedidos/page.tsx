'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartSidebar from '@/components/CartSidebar';
import CheckoutModal from '@/components/CheckoutModal';
import type { Order } from '@/lib/types';
import { formatCOP } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

const STATUS_LABELS: Record<Order['status'], { label: string; emoji: string; color: string }> = {
  pending:   { label: 'Pendiente',      emoji: '⏳', color: '#e8a020' },
  confirmed: { label: 'Confirmado',     emoji: '✅', color: '#4caf7d' },
  shipped:   { label: 'En camino',      emoji: '🚚', color: '#2196f3' },
  delivered: { label: 'Entregado',      emoji: '📦', color: '#4caf7d' },
  cancelled: { label: 'Cancelado',      emoji: '❌', color: '#e05252' },
};

export default function MisPedidosPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => { setOrders(data); setLoading(false); });
  }, [user]);

  if (authLoading) return null;

  return (
    <>
      <Navbar />
      <CartSidebar onCheckout={() => setCheckoutOpen(true)} />
      {checkoutOpen && <CheckoutModal onClose={() => setCheckoutOpen(false)} />}

      <main className={styles.main}>
        <div className="container">
          <h1 className="section-title" style={{ marginBottom: 8 }}>Mis Pedidos</h1>
          <p className="section-subtitle" style={{ marginBottom: 40 }}>Aquí puedes ver el estado de tus pedidos</p>

          {!user ? (
            <div className={styles.notAuth}>
              <span>🔒</span>
              <h2>Inicia sesión para ver tus pedidos</h2>
              <p>Debes tener una cuenta para rastrear tus pedidos.</p>
              <Link href="/login?redirect=/mis-pedidos" className="btn btn-primary btn-lg">Iniciar sesión</Link>
              <Link href="/registro" className="btn btn-secondary">Crear cuenta</Link>
            </div>
          ) : loading ? (
            <div className={styles.grid}>
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 160, borderRadius: 16 }} />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className={styles.empty}>
              <span>📭</span>
              <h2>No tienes pedidos aún</h2>
              <p>¡Haz tu primer pedido y aparecerá aquí!</p>
              <Link href="/" className="btn btn-primary">Explorar productos</Link>
            </div>
          ) : (
            <div className={styles.grid}>
              {orders.map((order) => {
                const info = STATUS_LABELS[order.status];
                return (
                  <div key={order.id} className={styles.card} id={`order-${order.id}`}>
                    <div className={styles.cardHead}>
                      <div>
                        <span className={styles.orderId}>📋 #{order.id.slice(0, 8).toUpperCase()}</span>
                        <span className={styles.date}>
                          {new Date(order.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      <span className={styles.status} style={{ color: info.color, borderColor: info.color, background: `${info.color}15` }}>
                        {info.emoji} {info.label}
                      </span>
                    </div>

                    <div className={styles.items}>
                      {order.items.map((item) => (
                        <div key={item.productId} className={styles.item}>
                          <span className={styles.itemName}>{item.name}</span>
                          <span className={styles.itemQty}>x{item.quantity}</span>
                          <span className={styles.itemPrice}>{formatCOP(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div className={styles.cardFoot}>
                      <div className={styles.delivery}>
                        <span>📍 {order.address}</span>
                        <span>📱 {order.phone}</span>
                      </div>
                      <div className={styles.total}>
                        Total: <strong>{formatCOP(order.total)}</strong>
                      </div>
                    </div>

                    {order.status === 'pending' && (
                      <div className={styles.pendingNote}>
                        ⏳ Tu pedido está siendo revisado. Recibirás confirmación pronto.
                      </div>
                    )}
                    {order.status === 'confirmed' && (
                      <div className={styles.confirmedNote}>
                        ✅ ¡Tu pedido fue confirmado! Pronto será enviado.
                      </div>
                    )}
                    {order.status === 'shipped' && (
                      <div className={styles.shippedNote}>
                        🚚 ¡Tu pedido está en camino! Prepárate para recibirlo.
                      </div>
                    )}
                    {order.status === 'cancelled' && (
                      <div className={styles.cancelledNote}>
                        ❌ Este pedido fue cancelado. Contáctanos si tienes dudas.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
