// ============================================================
// IN-MEMORY DATABASE — Livende
// Para conectar una DB real: reemplazar estas funciones CRUD
// por llamadas a Prisma (PostgreSQL), Mongoose, Supabase o Firebase SDK.
// ============================================================

import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import type { User, Catalog, Product, Order } from './types';

// ─── Seed Data ────────────────────────────────────────────────

const ADMIN_HASH = bcrypt.hashSync('libis2308', 10);

let users: User[] = [
  {
    id: uuidv4(),
    name: 'Administrador',
    email: 'admin',
    passwordHash: ADMIN_HASH,
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
];

let catalogs: Catalog[] = [
  {
    id: '1',
    name: 'Ropa de Cama',
    slug: 'ropa-de-cama',
    description: 'Sábanas, edredones y tendidos de alta calidad',
    imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&auto=format',
    order: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Cortinas',
    slug: 'cortinas',
    description: 'Cortinas decorativas para todo tipo de ambiente',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format',
    order: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Zapatos',
    slug: 'zapatos',
    description: 'Calzado elegante y casual para toda la familia',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format',
    order: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Hogar',
    slug: 'hogar',
    description: 'Artículos decorativos y funcionales para tu hogar',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&auto=format',
    order: 4,
    createdAt: new Date().toISOString(),
  },
];

let products: Product[] = [
  {
    id: '1',
    catalogId: '1',
    name: 'Juego de Sábanas Premium 100% Algodón',
    description: 'Juego de sábanas de algodón pima de 400 hilos, suavidad extraordinaria. Incluye sábana encimera, ajustable y 2 fundas de almohada. Disponible en tallas doble, queen y king.',
    price: 185000,
    imageUrl: 'https://images.unsplash.com/photo-1600369671236-e74521d4b6ad?w=600&auto=format',
    featured: true,
    stock: 20,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    catalogId: '1',
    name: 'Edredón Nórdico Con Bordes Dorados',
    description: 'Edredón reversible con diseño elegante y bordes dorados. Relleno de fibra hueca siliconada, cálido y ligero. Perfecto para temperatura media. Tallas queen y king.',
    price: 290000,
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format',
    featured: true,
    stock: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    catalogId: '2',
    name: 'Cortinas Blackout Velvet Gris Oscuro',
    description: 'Cortinas blackout de terciopelo gris oscuro que bloquean el 99% de la luz. Ideales para dormitorios. 2 paños de 140x230 cm. Incluye argollas metálicas.',
    price: 145000,
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format',
    featured: true,
    stock: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    catalogId: '2',
    name: 'Cortinas Sheer Lino Natural Beige',
    description: 'Cortinas semi-transparentes de lino natural en tono beige cálido. Filtran la luz suavemente y dan un toque elegante y minimalista. 2 paños de 140x260 cm.',
    price: 98000,
    imageUrl: 'https://images.unsplash.com/photo-1534889156217-d643df14f14a?w=600&auto=format',
    featured: false,
    stock: 25,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    catalogId: '3',
    name: 'Zapatos Oxford Cuero Café Hombre',
    description: 'Zapatos oxford clásicos en cuero genuino color café oscuro. Suela de goma antideslizante. Tallas 38-46. Ideales para ejecutivos y eventos formales.',
    price: 320000,
    imageUrl: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&auto=format',
    featured: true,
    stock: 18,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    catalogId: '3',
    name: 'Sandalias Planas Cuero Mujer',
    description: 'Sandalias planas de cuero genuino color nude. Diseño minimalista con tira ajustable. Comodidad todo el día. Tallas 35-41.',
    price: 165000,
    imageUrl: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&auto=format',
    featured: false,
    stock: 22,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '7',
    catalogId: '4',
    name: 'Cojines Decorativos Boho Set x4',
    description: 'Juego de 4 cojines decorativos en estilo Boho con flecos naturales. Colores tierra: terracota, ocre, beige y blanco. Funda en tela de algodón texturizado. Relleno incluido.',
    price: 78000,
    imageUrl: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=600&auto=format',
    featured: true,
    stock: 40,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '8',
    catalogId: '4',
    name: 'Lámpara de Mesa Rattan Artesanal',
    description: 'Lámpara de mesa tejida a mano en rattan natural. Base de cerámica blanca. Compatible con bombillas E27 de hasta 40W. Altura 45 cm. Crea una atmósfera cálida y acogedora.',
    price: 95000,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format',
    featured: false,
    stock: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let orders: Order[] = [];

// ─── User CRUD ────────────────────────────────────────────────

export function findUserByEmail(email: string): User | undefined {
  return users.find((u) => u.email === email);
}

export function findUserById(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

export function createUser(name: string, email: string, passwordHash: string): User {
  const newUser: User = {
    id: uuidv4(),
    name,
    email,
    passwordHash,
    role: 'user',
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  return newUser;
}

// ─── Catalog CRUD ─────────────────────────────────────────────

export function getAllCatalogs(): Catalog[] {
  return [...catalogs].sort((a, b) => a.order - b.order);
}

export function getCatalogBySlug(slug: string): Catalog | undefined {
  return catalogs.find((c) => c.slug === slug);
}

export function getCatalogById(id: string): Catalog | undefined {
  return catalogs.find((c) => c.id === id);
}

export function createCatalog(data: Omit<Catalog, 'id' | 'createdAt'>): Catalog {
  const catalog: Catalog = {
    id: uuidv4(),
    ...data,
    createdAt: new Date().toISOString(),
  };
  catalogs.push(catalog);
  return catalog;
}

export function updateCatalog(id: string, data: Partial<Omit<Catalog, 'id' | 'createdAt'>>): Catalog | null {
  const idx = catalogs.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  catalogs[idx] = { ...catalogs[idx], ...data };
  return catalogs[idx];
}

export function deleteCatalog(id: string): boolean {
  const before = catalogs.length;
  catalogs = catalogs.filter((c) => c.id !== id);
  return catalogs.length < before;
}

// ─── Product CRUD ─────────────────────────────────────────────

export function getAllProducts(): Product[] {
  return [...products];
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCatalog(catalogId: string): Product[] {
  return products.filter((p) => p.catalogId === catalogId);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return products.filter(
    (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
  );
}

export function createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
  const product: Product = {
    id: uuidv4(),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  products.push(product);
  return product;
}

export function updateProduct(id: string, data: Partial<Omit<Product, 'id' | 'createdAt'>>): Product | null {
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...data, updatedAt: new Date().toISOString() };
  return products[idx];
}

export function deleteProduct(id: string): boolean {
  const before = products.length;
  products = products.filter((p) => p.id !== id);
  return products.length < before;
}

// ─── Order CRUD ───────────────────────────────────────────────

export function getAllOrders(): Order[] {
  return [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createOrder(data: Omit<Order, 'id' | 'createdAt' | 'status'>): Order {
  const order: Order = {
    id: uuidv4(),
    ...data,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  return order;
}

export function getOrdersByUser(userId: string): Order[] {
  return [...orders]
    .filter((o) => o.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getOrderById(id: string): Order | undefined {
  return orders.find((o) => o.id === id);
}

export function updateOrderStatus(id: string, status: Order['status']): Order | null {
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  orders[idx] = { ...orders[idx], status };
  return orders[idx];
}
