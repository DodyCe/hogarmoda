// ============================================================
// DATABASE LAYER — Supabase
// Reemplaza db.ts. Misma interfaz pública, ahora persistente.
// ============================================================

import { supabase } from './supabase';
import bcrypt from 'bcryptjs';
import type { User, Catalog, Product, Order, SizePreset, SizeOption, SizeType } from './types';

// ─── Helpers: snake_case ↔ camelCase ────────────────────────

function rowToUser(r: Record<string, unknown>): User {
  return {
    id: r.id as string,
    name: r.name as string,
    email: r.email as string,
    passwordHash: r.password_hash as string,
    role: r.role as 'user' | 'admin',
    createdAt: r.created_at as string,
  };
}

function rowToCatalog(r: Record<string, unknown>): Catalog {
  return {
    id: r.id as string,
    name: r.name as string,
    slug: r.slug as string,
    description: (r.description as string) || '',
    imageUrl: (r.image_url as string) || '',
    order: r.order as number,
    createdAt: r.created_at as string,
  };
}

function rowToProduct(r: Record<string, unknown>): Product {
  return {
    id: r.id as string,
    catalogId: (r.catalog_id as string) || '',
    name: r.name as string,
    description: (r.description as string) || '',
    price: r.price as number,
    imageUrl: (r.image_url as string) || '',
    featured: (r.featured as boolean) || false,
    stock: (r.stock as number) || 0,
    sizeType: (r.size_type as SizeType) || 'none',
    customSizeOptions: (r.custom_size_options as SizeOption[]) || [],
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

function rowToOrder(r: Record<string, unknown>): Order {
  return {
    id: r.id as string,
    userId: (r.user_id as string) || undefined,
    customerName: r.customer_name as string,
    phone: r.phone as string,
    address: r.address as string,
    notes: (r.notes as string) || '',
    items: (r.items as Order['items']) || [],
    total: r.total as number,
    status: r.status as Order['status'],
    createdAt: r.created_at as string,
  };
}

function rowToSizePreset(r: Record<string, unknown>): SizePreset {
  return {
    id: r.id as string,
    sizeType: r.size_type as SizeType,
    label: r.label as string,
    value: r.value as string,
    order: r.order as number,
    createdAt: r.created_at as string,
  };
}

// ─── User CRUD ────────────────────────────────────────────────

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const { data } = await supabase.from('users').select('*').eq('email', email).single();
  return data ? rowToUser(data) : undefined;
}

export async function findUserById(id: string): Promise<User | undefined> {
  const { data } = await supabase.from('users').select('*').eq('id', id).single();
  return data ? rowToUser(data) : undefined;
}

export async function createUser(name: string, email: string, passwordHash: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .insert({ name, email, password_hash: passwordHash, role: 'user' })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return rowToUser(data);
}

// ─── Catalog CRUD ─────────────────────────────────────────────

export async function getAllCatalogs(): Promise<Catalog[]> {
  const { data } = await supabase.from('catalogs').select('*').order('order');
  return (data || []).map(rowToCatalog);
}

export async function getCatalogBySlug(slug: string): Promise<Catalog | undefined> {
  const { data } = await supabase.from('catalogs').select('*').eq('slug', slug).single();
  return data ? rowToCatalog(data) : undefined;
}

export async function getCatalogById(id: string): Promise<Catalog | undefined> {
  const { data } = await supabase.from('catalogs').select('*').eq('id', id).single();
  return data ? rowToCatalog(data) : undefined;
}

export async function createCatalog(input: Omit<Catalog, 'id' | 'createdAt'>): Promise<Catalog> {
  const slug = input.slug || input.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const { data, error } = await supabase
    .from('catalogs')
    .insert({ name: input.name, slug, description: input.description, image_url: input.imageUrl, order: input.order })
    .select().single();
  if (error) throw new Error(error.message);
  return rowToCatalog(data);
}

export async function updateCatalog(id: string, input: Partial<Omit<Catalog, 'id' | 'createdAt'>>): Promise<Catalog | null> {
  const updates: Record<string, unknown> = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.slug !== undefined) updates.slug = input.slug;
  if (input.description !== undefined) updates.description = input.description;
  if (input.imageUrl !== undefined) updates.image_url = input.imageUrl;
  if (input.order !== undefined) updates.order = input.order;
  const { data } = await supabase.from('catalogs').update(updates).eq('id', id).select().single();
  return data ? rowToCatalog(data) : null;
}

export async function deleteCatalog(id: string): Promise<boolean> {
  const { error } = await supabase.from('catalogs').delete().eq('id', id);
  return !error;
}

// ─── Product CRUD ─────────────────────────────────────────────

export async function getAllProducts(): Promise<Product[]> {
  const { data } = await supabase.from('products').select('*').order('created_at');
  return (data || []).map(rowToProduct);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const { data } = await supabase.from('products').select('*').eq('id', id).single();
  return data ? rowToProduct(data) : undefined;
}

export async function getProductsByCatalog(catalogId: string): Promise<Product[]> {
  const { data } = await supabase.from('products').select('*').eq('catalog_id', catalogId).order('created_at');
  return (data || []).map(rowToProduct);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const { data } = await supabase.from('products').select('*').eq('featured', true).order('created_at');
  return (data || []).map(rowToProduct);
}

export async function searchProducts(query: string, catalogId?: string): Promise<Product[]> {
  let q = supabase.from('products').select('*');
  if (query) q = q.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
  if (catalogId) q = q.eq('catalog_id', catalogId);
  const { data } = await q.order('created_at');
  return (data || []).map(rowToProduct);
}

export async function createProduct(input: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert({
      catalog_id: input.catalogId || null,
      name: input.name,
      description: input.description,
      price: input.price,
      image_url: input.imageUrl,
      featured: input.featured,
      stock: input.stock,
      size_type: input.sizeType || 'none',
      custom_size_options: input.customSizeOptions || [],
    })
    .select().single();
  if (error) throw new Error(error.message);
  return rowToProduct(data);
}

export async function updateProduct(id: string, input: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<Product | null> {
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.name !== undefined) updates.name = input.name;
  if (input.description !== undefined) updates.description = input.description;
  if (input.price !== undefined) updates.price = input.price;
  if (input.imageUrl !== undefined) updates.image_url = input.imageUrl;
  if (input.featured !== undefined) updates.featured = input.featured;
  if (input.stock !== undefined) updates.stock = input.stock;
  if (input.catalogId !== undefined) updates.catalog_id = input.catalogId || null;
  if (input.sizeType !== undefined) updates.size_type = input.sizeType;
  if (input.customSizeOptions !== undefined) updates.custom_size_options = input.customSizeOptions;
  const { data } = await supabase.from('products').update(updates).eq('id', id).select().single();
  return data ? rowToProduct(data) : null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  return !error;
}

// ─── Order CRUD ───────────────────────────────────────────────

export async function getAllOrders(): Promise<Order[]> {
  const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  return (data || []).map(rowToOrder);
}

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const { data } = await supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return (data || []).map(rowToOrder);
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const { data } = await supabase.from('orders').select('*').eq('id', id).single();
  return data ? rowToOrder(data) : undefined;
}

export async function createOrder(input: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: input.userId || null,
      customer_name: input.customerName,
      phone: input.phone,
      address: input.address,
      notes: input.notes || '',
      items: input.items,
      total: input.total,
      status: 'pending',
    })
    .select().single();
  if (error) throw new Error(error.message);
  return rowToOrder(data);
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<Order | null> {
  const { data } = await supabase.from('orders').update({ status }).eq('id', id).select().single();
  return data ? rowToOrder(data) : null;
}

// ─── Size Presets CRUD ────────────────────────────────────────

export async function getSizePresets(sizeType?: SizeType): Promise<SizePreset[]> {
  let q = supabase.from('size_presets').select('*');
  if (sizeType) q = q.eq('size_type', sizeType);
  const { data } = await q.order('order');
  return (data || []).map(rowToSizePreset);
}

export async function createSizePreset(input: Omit<SizePreset, 'id' | 'createdAt'>): Promise<SizePreset> {
  const { data, error } = await supabase
    .from('size_presets')
    .insert({ size_type: input.sizeType, label: input.label, value: input.value, order: input.order })
    .select().single();
  if (error) throw new Error(error.message);
  return rowToSizePreset(data);
}

export async function updateSizePreset(id: string, input: Partial<Omit<SizePreset, 'id' | 'createdAt'>>): Promise<SizePreset | null> {
  const updates: Record<string, unknown> = {};
  if (input.label !== undefined) updates.label = input.label;
  if (input.value !== undefined) updates.value = input.value;
  if (input.order !== undefined) updates.order = input.order;
  if (input.sizeType !== undefined) updates.size_type = input.sizeType;
  const { data } = await supabase.from('size_presets').update(updates).eq('id', id).select().single();
  return data ? rowToSizePreset(data) : null;
}

export async function deleteSizePreset(id: string): Promise<boolean> {
  const { error } = await supabase.from('size_presets').delete().eq('id', id);
  return !error;
}

// ─── Seed admin user (llamar una vez) ─────────────────────────
export async function ensureAdminExists(): Promise<void> {
  const existing = await findUserByEmail('admin');
  if (!existing) {
    const hash = bcrypt.hashSync('libis2308', 10);
    await supabase.from('users').insert({ name: 'Administrador', email: 'admin', password_hash: hash, role: 'admin' });
  } else if (existing.role !== 'admin') {
    await supabase.from('users').update({ role: 'admin' }).eq('email', 'admin');
  }
}
