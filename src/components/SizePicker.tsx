'use client';

import React, { useState, useEffect } from 'react';
import type { Product, SizePreset, SizeOption } from '@/lib/types';
import styles from './SizePicker.module.css';

interface Props {
  product: Product;
  onConfirm: (size: string) => void;
  onCancel: () => void;
}

const SIZE_TYPE_LABELS: Record<string, { title: string; placeholder: string; hint: string }> = {
  shoes:       { title: '👟 Selecciona tu talla',   placeholder: 'Ej: 39, 40, 42…',          hint: 'Ingresa tu número de pie' },
  curtains:    { title: '📐 Selecciona la medida',  placeholder: 'Ej: 2x2.5, 1.5x2.3…',     hint: 'Ancho × Alto en metros' },
  accessories: { title: '💍 Medida o referencia',   placeholder: 'Ej: Única, S, M, L…',      hint: 'Escribe la medida si aplica' },
};

export default function SizePicker({ product, onConfirm, onCancel }: Props) {
  const [globalPresets, setGlobalPresets] = useState<SizePreset[]>([]);
  const [selected, setSelected] = useState('');
  const [custom, setCustom] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const info = SIZE_TYPE_LABELS[product.sizeType] || SIZE_TYPE_LABELS.shoes;

  // Combinar opciones globales + las del producto
  const allOptions: SizeOption[] = [
    ...globalPresets.map((p) => ({ label: p.label, value: p.value })),
    ...product.customSizeOptions,
  ];

  useEffect(() => {
    fetch(`/api/size-presets?type=${product.sizeType}`)
      .then((r) => r.json())
      .then(setGlobalPresets);
  }, [product.sizeType]);

  const handleConfirm = () => {
    const finalSize = useCustom ? custom.trim() : selected;
    if (!finalSize) return;
    onConfirm(finalSize);
  };

  return (
    <>
      <div className="overlay" onClick={onCancel} />
      <div className={styles.modal} id="size-picker-modal">
        <div className={styles.header}>
          <h2>{info.title}</h2>
          <button className={styles.closeBtn} onClick={onCancel}>✕</button>
        </div>
        <div className={styles.body}>
          <p className={styles.productName}>{product.name}</p>

          {!useCustom && (
            <>
              <p className={styles.label}>Elige una opción:</p>
              <div className={styles.options}>
                {allOptions.map((opt) => (
                  <button
                    key={opt.value}
                    className={`${styles.option} ${selected === opt.value ? styles.optionSelected : ''}`}
                    onClick={() => setSelected(opt.value)}
                    id={`size-opt-${opt.value}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <button className={styles.switchLink} onClick={() => setUseCustom(true)}>
                ✏️ Ingresar {product.sizeType === 'curtains' ? 'medida' : 'talla'} personalizada
              </button>
            </>
          )}

          {useCustom && (
            <>
              <p className={styles.label}>{info.hint}:</p>
              <input
                className="form-input"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder={info.placeholder}
                autoFocus
                id="custom-size-input"
              />
              {allOptions.length > 0 && (
                <button className={styles.switchLink} onClick={() => setUseCustom(false)}>
                  ← Ver opciones predefinidas
                </button>
              )}
            </>
          )}
        </div>

        <div className={styles.footer}>
          <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
          <button
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={useCustom ? !custom.trim() : !selected}
            id="confirm-size-button"
          >
            Agregar al carrito 🛒
          </button>
        </div>
      </div>
    </>
  );
}
