'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Product, OrderItem } from '@/lib/types';

interface CartContextType {
  items: OrderItem[];
  total: number;
  count: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, selectedSize?: string) => void;
  removeItem: (productId: string, selectedSize?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedSize?: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

// A cart key uniquely identifies a product+size combination
function cartKey(productId: string, selectedSize?: string) {
  return selectedSize ? `${productId}::${selectedSize}` : productId;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((product: Product, selectedSize?: string) => {
    setItems((prev) => {
      const key = cartKey(product.id, selectedSize);
      const existing = prev.find((i) => cartKey(i.productId, i.selectedSize) === key);
      if (existing) {
        return prev.map((i) =>
          cartKey(i.productId, i.selectedSize) === key
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        selectedSize,
      }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string, selectedSize?: string) => {
    setItems((prev) => prev.filter((i) => cartKey(i.productId, i.selectedSize) !== cartKey(productId, selectedSize)));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, selectedSize?: string) => {
    if (quantity <= 0) { removeItem(productId, selectedSize); return; }
    setItems((prev) =>
      prev.map((i) =>
        cartKey(i.productId, i.selectedSize) === cartKey(productId, selectedSize)
          ? { ...i, quantity }
          : i
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, total, count, isOpen, openCart, closeCart, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
