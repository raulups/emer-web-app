-- ============================================================
-- Prioridad de orden derivada de brands.tags
-- popular = 1, emergente = 2, novedad = 3, sin ninguno de estos = 4
-- Si una marca tiene varios tags, se usa el de mayor prioridad (número más bajo)
-- ============================================================
--
-- ESTADO: OPCIONAL. La aplicación YA NO depende de este fichero.
--
-- El orden popular -> emergente -> novedad -> sin tag se resuelve ahora en
-- la propia app, en lib/supabase/queries.ts, leyendo `brands.tags` (que ya
-- existe). Motivo: PostgREST no sabe ordenar por una expresión sobre un
-- array de enum ni ordenar productos por una columna de la tabla embebida,
-- así que hacía falta esta columna generada + vista; y mientras no se
-- ejecutaran, el catálogo entero se quedaba sin ordenar.
--
-- Ejecutarlo sigue siendo útil si algún día el catálogo crece y se quiere
-- mover el orden a SQL: la columna generada y su índice permitirían resolver
-- el orden en una sola consulta, en vez del recorrido por grupos que hace
-- hoy la app (un recuento y una consulta por grupo de prioridad).
--
-- Si lo ejecutas, no rompe nada: la app no lee ni `tag_priority` ni la vista.
--
-- El enum `brand_tag` y la columna `brands.tags` YA existen en la base
-- (verificado: el enum acepta 'popular', 'emergente' y 'novedad' y rechaza
-- cualquier otro valor), así que aquí no se crean.

create or replace function brand_tag_priority(t brand_tag[])
returns int
language sql
immutable
as $$
  select min(
    case tag
      when 'popular'   then 1
      when 'emergente' then 2
      when 'novedad'   then 3
      else 4
    end
  )
  from unnest(t) as tag
$$;

-- Columna generada: se recalcula sola cada vez que cambia `tags`
alter table brands
  add column if not exists tag_priority int
  generated always as (coalesce(brand_tag_priority(tags), 4)) stored;

create index if not exists idx_brands_tag_priority on brands (tag_priority);

-- Vista para ordenar productos por prioridad de su marca sin tocar la tabla products
create or replace view products_with_brand_priority as
select p.*, b.tag_priority as brand_tag_priority
from products p
join brands b on b.id = p.brand_id;

-- ------------------------------------------------------------
-- Lectura pública de la vista
-- ------------------------------------------------------------
-- Una vista normal se ejecuta con los permisos de quien la creó, así que no
-- hereda las policies RLS de `products`/`brands` — pero sí necesita GRANT
-- explícito para que PostgREST la pueda servir a los roles anónimo y
-- autenticado. Sin esto, el catálogo responde 404 sobre la vista.
grant select on products_with_brand_priority to anon, authenticated;

-- `security_invoker` (PostgreSQL 15+, que es lo que corre Supabase) hace que
-- la vista respete las policies RLS del usuario que consulta, en vez de las
-- del propietario. Aquí el catálogo es de lectura pública, así que el efecto
-- es el mismo, pero deja la vista alineada con las policies si algún día se
-- restringe `products`.
alter view products_with_brand_priority set (security_invoker = on);

-- ------------------------------------------------------------
-- Limpieza — ejecutar A MANO cuando confirmes que todo funciona
-- ------------------------------------------------------------
-- `is_emergent` ya no lo escribe ni lo lee el código (formularios, endpoints
-- y vistas usan `tags`). Se deja la columna viva hasta que lo verifiques,
-- porque al borrarla se pierde el dato de las marcas antiguas.
--
--   alter table brands drop column if exists is_emergent;
