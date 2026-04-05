-- ============================================================
-- Livende — Supabase Migration
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

-- USUARIOS
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password_hash text not null,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);

-- CATÁLOGOS
create table if not exists public.catalogs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text default '',
  image_url text default '',
  "order" int not null default 99,
  created_at timestamptz not null default now()
);

-- TALLAS / MEDIDAS PREDEFINIDAS (gestionadas por el admin)
create table if not exists public.size_presets (
  id uuid primary key default gen_random_uuid(),
  size_type text not null check (size_type in ('shoes','curtains','accessories')),
  label text not null,
  value text not null,
  "order" int not null default 99,
  created_at timestamptz not null default now()
);

-- PRODUCTOS
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  catalog_id uuid references public.catalogs(id) on delete set null,
  name text not null,
  description text default '',
  price numeric not null,
  image_url text default '',
  featured boolean not null default false,
  stock int not null default 0,
  size_type text not null default 'none' check (size_type in ('none','shoes','curtains','accessories')),
  custom_size_options jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- PEDIDOS
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  customer_name text not null,
  phone text not null,
  address text not null,
  notes text default '',
  items jsonb not null default '[]',
  total numeric not null,
  status text not null default 'pending'
    check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  created_at timestamptz not null default now()
);

-- Deshabilitar RLS (auth manejada por JWT propio de la app)
alter table public.users disable row level security;
alter table public.catalogs disable row level security;
alter table public.products disable row level security;
alter table public.orders disable row level security;
alter table public.size_presets disable row level security;

-- =============================================
-- SEED: Catálogos
-- =============================================
insert into public.catalogs (name, slug, description, image_url, "order") values
  ('Ropa de Cama', 'ropa-de-cama', 'Sábanas, edredones y tendidos de alta calidad', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&auto=format', 1),
  ('Cortinas', 'cortinas', 'Cortinas decorativas para todo tipo de ambiente', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format', 2),
  ('Zapatos', 'zapatos', 'Calzado elegante y casual para toda la familia', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format', 3),
  ('Hogar', 'hogar', 'Artículos decorativos y funcionales para tu hogar', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&auto=format', 4),
  ('Accesorios', 'accesorios', 'Collares, aretes y bisutería de moda', 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&auto=format', 5)
on conflict do nothing;

-- =============================================
-- SEED: Tallas predefinidas — Zapatos
-- =============================================
insert into public.size_presets (size_type, label, value, "order") values
  ('shoes', 'Talla 35 — Pequeño',   '35', 1),
  ('shoes', 'Talla 36',             '36', 2),
  ('shoes', 'Talla 37',             '37', 3),
  ('shoes', 'Talla 38 — Mediano',   '38', 4),
  ('shoes', 'Talla 39',             '39', 5),
  ('shoes', 'Talla 40',             '40', 6),
  ('shoes', 'Talla 41',             '41', 7),
  ('shoes', 'Talla 42 — Grande',    '42', 8),
  ('shoes', 'Talla 43',             '43', 9),
  ('shoes', 'Talla 44',             '44', 10)
on conflict do nothing;

-- =============================================
-- SEED: Medidas predefinidas — Cortinas
-- =============================================
insert into public.size_presets (size_type, label, value, "order") values
  ('curtains', 'Pequeño — 1m × 1.5m',      '1x1.5',   1),
  ('curtains', 'Pequeño — 1.2m × 2m',      '1.2x2',   2),
  ('curtains', 'Mediano — 1.5m × 2m',      '1.5x2',   3),
  ('curtains', 'Mediano — 2m × 2m',        '2x2',     4),
  ('curtains', 'Grande — 2m × 2.5m',       '2x2.5',   5),
  ('curtains', 'Grande — 2.5m × 2.5m',     '2.5x2.5', 6),
  ('curtains', 'Extra Grande — 3m × 2.5m', '3x2.5',   7),
  ('curtains', 'Extra Grande — 3m × 3m',   '3x3',     8)
on conflict do nothing;

-- =============================================
-- SEED: Admin user (contraseña: libis2308)
-- Nota: el hash se genera con bcrypt rounds=10
-- Si usas la UI de la app para registrarte como admin
-- y luego actualizar el role a 'admin' en Supabase Table Editor
-- =============================================

-- =============================================
-- SEED: Productos de ejemplo
-- (Reemplaza catalog_id con los UUIDs reales de tus catálogos)
-- Ve a Table Editor → catalogs, copia los IDs y úsalos aquí
-- O deja que la app genere los productos desde el panel admin
-- =============================================
