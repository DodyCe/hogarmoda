// ============================================================
// TypeScript Interfaces — Livende
// ============================================================

export type SizeType = 'none' | 'shoes' | 'curtains' | 'accessories';

export interface SizeOption {
  label: string;  // "Talla 38 — Mediano"
  value: string;  // "38"
}

export interface SizePreset {
  id: string;
  sizeType: SizeType;
  label: string;
  value: string;
  order: number;
  createdAt: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  name: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Catalog {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  order: number;
  createdAt: string;
}

export interface Product {
  id: string;
  catalogId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  featured: boolean;
  stock: number;
  sizeType: SizeType;             // tipo de variante requerida
  customSizeOptions: SizeOption[]; // opciones extra por producto (además de las globales)
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  selectedSize?: string;  // talla o medida elegida por el usuario
}

export interface Order {
  id: string;
  userId?: string;
  customerName: string;
  phone: string;
  address: string;
  notes: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}
