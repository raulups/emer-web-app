-- ============================================================================
-- Autenticación + rol de administrador
-- ----------------------------------------------------------------------------
-- Ejecutar UNA VEZ en el SQL Editor de Supabase (Dashboard > SQL Editor).
-- El script es idempotente: se puede volver a lanzar sin romper nada.
--
-- >>> IMPORTANTE — CÓMO CREAR UN ADMINISTRADOR <<<
-- No hay UI para gestionar roles. Toda cuenta nueva se crea como 'user'.
-- Para convertir una cuenta en admin, regístrate primero desde la web y
-- después ejecuta aquí mismo, a mano:
--
--     update profiles set role = 'admin' where email = 'tu@email.com';
--
-- ============================================================================

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Cada usuario solo puede leer su propia fila.
drop policy if exists "profiles_select_own" on profiles;
create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);

-- Deliberadamente NO se crean policies de insert/update/delete: sin ellas, y
-- con RLS activo, el cliente no puede tocar la tabla en absoluto. Esto es lo
-- que impide que un usuario se ascienda a sí mismo a 'admin' desde el
-- navegador. La fila la crea el trigger de abajo (security definer, salta
-- RLS) y el rol se cambia a mano desde este mismo SQL Editor.

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
-- search_path fijo: una función security definer sin él es vulnerable a que
-- un rol con permiso de creación en otro esquema anteponga una tabla
-- `profiles` falsa y capture la inserción.
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Fila de perfil para cuentas que ya existieran antes de instalar el trigger.
insert into public.profiles (id, email, role)
select u.id, u.email, 'user'
from auth.users u
where u.email is not null
on conflict (id) do nothing;

-- ============================================================================
-- Lectura pública del catálogo para cuentas YA autenticadas
-- ----------------------------------------------------------------------------
-- Al iniciar sesión, PostgREST deja de actuar como `anon` y pasa a
-- `authenticated`. Una policy declarada `for select to anon` NO cubre ese rol,
-- así que sin esto el catálogo se vaciaría justo después de hacer login — un
-- fallo desconcertante, porque en modo anónimo todo se ve bien.
--
-- Son policies ADITIVAS: las de RLS se combinan con OR, así que estas solo
-- pueden conceder lectura, nunca quitar la que ya haya. Si tus policies
-- actuales ya usan `to public` (o no declaran rol), estas son redundantes
-- pero inofensivas.
-- ============================================================================

drop policy if exists "authenticated read brands" on public.brands;
create policy "authenticated read brands" on public.brands
  for select to authenticated using (true);

drop policy if exists "authenticated read categories" on public.categories;
create policy "authenticated read categories" on public.categories
  for select to authenticated using (true);

drop policy if exists "authenticated read products" on public.products;
create policy "authenticated read products" on public.products
  for select to authenticated using (true);

drop policy if exists "authenticated read product_price_history" on public.product_price_history;
create policy "authenticated read product_price_history" on public.product_price_history
  for select to authenticated using (true);
