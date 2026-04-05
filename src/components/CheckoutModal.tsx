'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatCOP } from '@/lib/utils';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import styles from './CheckoutModal.module.css';

interface Props {
  onClose: () => void;
}

export default function CheckoutModal({ onClose }: Props) {
  const { items, total, clearCart } = useCart();
  const [step, setStep] = useState<'form' | 'confirm' | 'done'>('form');
  const [form, setForm] = useState({ name: '', phone: '', address: '', notes: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [savedOrderId, setSavedOrderId] = useState<string | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) newErrors.name = 'Ingresa tu nombre completo';
    if (!form.phone.trim() || !/^\d{7,15}$/.test(form.phone.replace(/\s/g, ''))) newErrors.phone = 'Teléfono inválido (mínimo 7 dígitos)';
    if (!form.address.trim() || form.address.trim().length < 5) newErrors.address = 'Ingresa tu dirección completa';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) setStep('confirm');
  };

  const handleConfirm = async () => {
    setSaving(true);
    try {
      // Guardar pedido en la DB
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.name,
          phone: form.phone,
          address: form.address,
          notes: form.notes,
          items,
          total,
        }),
      });
      if (res.ok) {
        const order = await res.json();
        setSavedOrderId(order.id);
      }
    } catch { /* si la conexión falla, seguimos con WhatsApp */ }
    setSaving(false);

    // Abrir WhatsApp con el resumen del pedido
    const link = generateWhatsAppLink({
      customerName: form.name,
      phone: form.phone,
      address: form.address,
      notes: form.notes,
      items,
      total,
    });
    window.open(link, '_blank');
    setStep('done');
    clearCart();
  };

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className={styles.modal} role="dialog" aria-modal="true" id="checkout-modal">

        {/* ── Step 1: Form ── */}
        {step === 'form' && (
          <>
            <div className={styles.header}>
              <h2>📦 Datos de Entrega</h2>
              <button onClick={onClose} className={styles.closeBtn}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              <div className="form-group">
                <label className="form-label">Nombre completo *</label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Tu nombre completo"
                  id="checkout-name"
                />
                {errors.name && <p className="form-error">{errors.name}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono / WhatsApp *</label>
                <input
                  className="form-input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="3001234567"
                  type="tel"
                  id="checkout-phone"
                />
                {errors.phone && <p className="form-error">{errors.phone}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Dirección de entrega *</label>
                <input
                  className="form-input"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Calle, barrio, ciudad"
                  id="checkout-address"
                />
                {errors.address && <p className="form-error">{errors.address}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Información adicional (opcional)</label>
                <textarea
                  className={`form-input ${styles.textarea}`}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Apto, referencias, horario, etc."
                  rows={3}
                  id="checkout-notes"
                />
              </div>
              <div className={styles.totalBar}>
                <span>Total del pedido:</span>
                <strong>{formatCOP(total)}</strong>
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} id="checkout-next">
                Revisar pedido →
              </button>
            </form>
          </>
        )}

        {/* ── Step 2: Confirm ── */}
        {step === 'confirm' && (
          <>
            <div className={styles.header}>
              <h2>✅ Confirmar Pedido</h2>
              <button onClick={onClose} className={styles.closeBtn}>✕</button>
            </div>
            <div className={styles.confirmBody}>
              <div className={styles.summaryBlock}>
                <h3>Tus datos</h3>
                <p><strong>Nombre:</strong> {form.name}</p>
                <p><strong>Teléfono:</strong> {form.phone}</p>
                <p><strong>Dirección:</strong> {form.address}</p>
                {form.notes && <p><strong>Notas:</strong> {form.notes}</p>}
              </div>
              <div className={styles.summaryBlock}>
                <h3>Productos</h3>
                {items.map((item) => (
                  <div key={`${item.productId}::${item.selectedSize}`} className={styles.summaryItem}>
                    <span>
                      {item.name} x{item.quantity}
                      {item.selectedSize && (
                        <span className={styles.sizeTag}> — {item.selectedSize}</span>
                      )}
                    </span>
                    <span>{formatCOP(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className={styles.totalBar}>
                <span>Total contraentrega:</span>
                <strong>{formatCOP(total)}</strong>
              </div>
              <p className={styles.waNote}>
                📱 Al confirmar, serás redirigido a WhatsApp para enviar tu pedido al vendedor.
              </p>
              <div className={styles.confirmActions}>
                <button className="btn btn-secondary" onClick={() => setStep('form')}>← Editar</button>
                <button
                  className="btn btn-primary"
                  onClick={handleConfirm}
                  disabled={saving}
                  id="confirm-order-button"
                >
                  {saving ? 'Guardando…' : 'Enviar por WhatsApp 📲'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Step 3: Done ── */}
        {step === 'done' && (
          <div className={styles.done}>
            <span className={styles.doneIcon}>🎉</span>
            <h2>¡Pedido enviado!</h2>
            <p>Tu pedido fue enviado al vendedor por WhatsApp. ¡Pronto te contactarán para coordinar la entrega!</p>
            {savedOrderId && (
              <p className={styles.orderId}>
                📋 Número de pedido: <strong>#{savedOrderId.slice(0, 8).toUpperCase()}</strong>
              </p>
            )}
            <div className={styles.doneActions}>
              <Link href="/mis-pedidos" className="btn btn-secondary" onClick={onClose}>
                Ver mis pedidos
              </Link>
              <button className="btn btn-primary btn-lg" onClick={onClose} id="close-done-button">
                Seguir comprando
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
