-- Índices recomendados para las queries de esta app (lib/supabase/queries.ts).
--
-- Esta app solo usa la anon key (solo lectura) y no puede ejecutar DDL, así
-- que este script hay que correrlo aparte en el SQL editor de Supabase con
-- una cuenta con permisos suficientes (no se ejecuta desde la aplicación).
--
-- Justificación por índice, según los filtros/orden que arma getProductsPage /
-- getProductsCount en lib/supabase/queries.ts:

-- Filtro por marca (`FilterBar` -> `brand_id`, y toda la vista /brands/[brandId]).
create index if not exists idx_products_brand_id
  on public.products (brand_id);

-- Filtro por categoría (incluye jerarquía vía `category_id in (...)`).
create index if not exists idx_products_category_id
  on public.products (category_id);

-- Orden por defecto ("Más recientes") y fallback de todas las vistas de listado.
create index if not exists idx_products_created_at
  on public.products (created_at desc);

-- Orden por precio asc/desc y filtro por rango de precio (`current_price`).
create index if not exists idx_products_current_price
  on public.products (current_price);

-- Búsqueda por texto sobre `name` (ILIKE '%term%'). Un índice btree normal no
-- acelera ILIKE con comodín al principio; si la tabla crece y la búsqueda se
-- nota lenta, plantear pg_trgm en vez de btree:
--   create extension if not exists pg_trgm;
--   create index if not exists idx_products_name_trgm
--     on public.products using gin (name gin_trgm_ops);

-- Histórico de precio de un producto (`/products/[productId]`).
create index if not exists idx_product_price_history_product_id
  on public.product_price_history (product_id);

-- Combinación habitual: listar por marca ordenando por fecha (portada de marca).
create index if not exists idx_products_brand_id_created_at
  on public.products (brand_id, created_at desc);
