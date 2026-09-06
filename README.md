# Catálogo de marcas

Herramienta de exploración de un catálogo de marcas de ropa y sus productos.
No es un e-commerce (sin carrito ni checkout): es una app de solo lectura
sobre Supabase/PostgreSQL, pensada para escalar con más funcionalidades.
Lenguaje visual del handoff de Claude Design "Marketplace Moda"
(brutalismo editorial: Archivo 900, etiquetas mono, líneas de 1px), con
selector Mujer/Hombre y filtros siempre visibles.

## Stack

- **Next.js 14** (App Router) + TypeScript estricto
- **Tailwind CSS** — tokens del handoff "Marketplace Moda" (ver "Sistema de diseño")
- **Supabase JS client** (`@supabase/supabase-js`) — catálogo de solo lectura
  vía anon key; escritura solo en el endpoint de admin, con service_role
- **Supabase Auth** vía `@supabase/ssr` — email + contraseña, sesión en
  cookies (compartida entre navegador y servidor), rol en la tabla `profiles`
- **Framer Motion** — transiciones de página, parallax del hero, marquee,
  modales, acordeones y micro-interacciones

## Estructura

```
/app
  /brands/[brandId]        Página de marca + sus productos
  /products                Vista global de productos
  /products/[productId]    Detalle de producto
  /api/brands              POST: alta de marca (solo admin), subida a Storage
/components
  /ui                      Botones, badges, inputs genéricos, AnimatedCounter,
                            RouteProgressBar, FadeInImage, skeletons, Modal,
                            Toast, FileField, Marquee
  /auth                    AuthButton (header) + LoginModal (acceso/registro)
  /admin                   AdminBrandActions, CreateBrandModal/Form
  /brands                  Home: HomeIntro, BrandIndex, BrandHero, Directory,
                            BrandGrid (bento) + BrandCard, CatalogCta;
                            BrandHeader (+ skeletons)
  /products                ProductCard/Grid, ProductGridInfinite,
                            ProductsExplorer (toolbar + chips + drawer + grid),
                            galería, atributos, tallas, histórico de precio...
  /filters                 FilterToolbar, FilterDrawer, GridDensityToggle,
                            acordeón de filtros,
                            árbol de categorías, slider de precio, checklist
                            de marca, chips de filtros activos, SortDropdown
  /layout                  SiteHeader (+ selector de género), SearchOverlay,
                            SiteFooter, PageTransition
/lib
  /supabase                Clientes (navegador / servidor / servidor con
                            sesión / service_role) + queries tipadas
  /types                   Tipos derivados del esquema, tipos de filtros y
                            densidad de rejilla
  /utils                   Formateo (precio, fecha)
/hooks                     useProductFilters (URL + useTransition),
                            useInfiniteProducts, useIntersectionObserver,
                            useGenderQueryString, useDebouncedValue,
                            useGridDensity (persistida en localStorage),
                            useUser + AuthProvider (sesión y rol),
                            useSearchOverlay (estado del buscador)
/supabase/sql              Migración de auth + índices recomendados
```

## Setup

### 1. Requisitos

- Node.js 18.18+ (recomendado 20+)

### 2. Variables de entorno

Crea un archivo `.env.local` en la raíz (ya incluido en `.gitignore`) con:

```
NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<tu-service-role-key>
```

Todo el catálogo (navegación, filtros, detalle) funciona **solo con la anon
key pública**, apoyada en las policies RLS de `SELECT` público. La sesión de
usuario también va con esa clave.

`SUPABASE_SERVICE_ROLE_KEY` es la excepción y existe únicamente por el alta de
marcas del administrador: subir a Storage e insertar en `brands`. Va **sin
prefijo `NEXT_PUBLIC_`** a propósito — Next solo inyecta en el bundle del
navegador las variables con ese prefijo, así que esta nunca sale del servidor.
Su único consumidor es `lib/supabase/admin.ts`, que abre con
`import "server-only"`: si algún día acabara importada desde un Client
Component, el build falla en vez de filtrar la clave.

> **Esa clave salta RLS por completo.** No la pegues en ningún fichero que no
> sea `.env.local` (ignorado por git), y si sospechas que se ha expuesto,
> rótala desde el dashboard de Supabase.

Asegúrate de que las políticas RLS del proyecto de Supabase permiten `SELECT`
público (anónimo) sobre `brands`, `categories` y `products`. Si no existen,
créalas desde el dashboard de Supabase (SQL editor), por ejemplo:

```sql
alter table public.brands enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_price_history enable row level security;

create policy "public read brands" on public.brands
  for select to anon using (true);
create policy "public read categories" on public.categories
  for select to anon using (true);
create policy "public read products" on public.products
  for select to anon using (true);
create policy "public read product_price_history" on public.product_price_history
  for select to anon using (true);
```

`recommended_indexes.sql` añade índices en `brand_id`, `category_id`,
`created_at`, `current_price` y `product_price_history.product_id`, para que
el listado y la paginación no se degraden al crecer la tabla.

### 3. Tablas y policies

Ejecuta en el **SQL Editor** de Supabase, en este orden:

1. `supabase/sql/auth_profiles.sql` — crea `profiles`, su RLS, el trigger que
   da de alta el perfil de cada usuario nuevo, y extiende la lectura del
   catálogo al rol `authenticated` (ver más abajo por qué hace falta).
2. `supabase/sql/recommended_indexes.sql` — índices de listado y paginación.

La app solo tiene la anon key, así que no puede ejecutar ese DDL por sí misma.

### 4. Instalar dependencias

```bash
npm install
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### 6. Otros comandos

```bash
npm run build       # build de producción
npm run start        # sirve el build de producción
npm run lint          # ESLint (next/core-web-vitals)
npm run typecheck   # tsc --noEmit
```

## Autenticación y rol de administrador

Un visitante anónimo usa la web exactamente como antes: el catálogo entero es
público. La sesión solo añade una cosa — las cuentas con rol `admin` pueden
crear marcas, imágenes incluidas.

### Cómo hacer admin a una cuenta

> **No hay interfaz para gestionar roles.** Toda cuenta nueva nace como
> `user`, lo fija el trigger `on_auth_user_created`. Para ascender una cuenta,
> regístrate primero desde la web y luego ejecuta a mano en el **SQL Editor**
> de Supabase:
>
> ```sql
> update profiles set role = 'admin' where email = 'tu@email.com';
> ```
>
> Después, recarga la web (o vuelve a entrar) y aparecerá **+ CREAR MARCA** en
> el listado de marcas.

Que el ascenso sea manual es la decisión de diseño, no una carencia: `profiles`
tiene RLS activo y **solo** una policy de `SELECT` sobre la fila propia. Sin
policy de `INSERT`/`UPDATE`, el cliente no puede escribir en la tabla en
absoluto, así que nadie puede ascenderse a sí mismo desde el navegador.

### Cómo se comprueba el rol

`isAdmin` en el cliente es únicamente una señal de interfaz: decide si se
pinta el botón. La autorización real está en `app/api/brands/route.ts`, y son
dos pasos deliberadamente separados:

1. `auth.getUser()` sobre el cliente de cookies — **no** `getSession()`.
   `getUser()` revalida el JWT contra el servidor de Supabase; `getSession()`
   se limita a decodificar la cookie, que llega del navegador y por tanto no
   sirve como control de acceso.
2. El rol se relee de `profiles` con la service_role key, nunca del token ni
   de nada que haya mandado el cliente.

Manipular `isAdmin` desde las devtools solo consigue ver un botón cuyo
endpoint responde 403.

### Sesión en cookies, no en localStorage

El cliente de navegador (`lib/supabase/client.ts`) usa `createBrowserClient`
de `@supabase/ssr`, que guarda la sesión en **cookies**. Es lo que permite que
el login que ocurre en el navegador lo pueda leer el servidor
(`createServerSupabaseAuthClient`) para autorizar el `POST`. Con la sesión en
localStorage, el endpoint no tendría forma de saber quién llama.

Hay **dos** clientes de servidor a propósito:

| Cliente | Clave | Lee cookies | Para qué |
| --- | --- | --- | --- |
| `createServerSupabaseClient` | anon | no | Catálogo en Server Components. Al no leer cookies no marca la ruta como dinámica, y `/` sigue prerenderizándose estática. |
| `createServerSupabaseAuthClient` | anon | sí | Saber quién llama al endpoint de admin. |
| `createAdminSupabaseClient` | service_role | no | Leer el rol, subir a Storage e insertar. Solo desde el route handler. |

No hay `middleware.ts`: obligaría a que **todas** las rutas leyeran cookies y
pasaran a dinámicas, perdiendo el prerender estático del listado de marcas. El
refresco de token lo hace el cliente de navegador, que es quien tiene la
sesión viva.

`supabase-js` se carga con `import()` diferido desde el `AuthProvider`, igual
que ya hacían el scroll infinito y el drawer de filtros: son ~70 kB que no
tienen por qué entrar en el bundle crítico de una portada de catálogo.

### Alta de marca

El formulario manda `multipart/form-data` (no JSON, porque lleva ficheros) a
`POST /api/brands`. El servidor valida cada imagen —tipo `image/*` y 5 MB
máximo—, **antes** de tocar Storage, para que una petición inválida no deje
ficheros subidos sin fila que los referencie.

El nombre en el bucket es determinista: slug de la marca + sufijo + extensión
original (`dameapresparis_image.webp`). Con `upsert: true`, reintentar la
misma marca sobrescribe el fichero en vez de acumular duplicados. La
contrapartida asumida es que dos marcas cuyo nombre produzca el mismo slug
compartirían fichero — aceptable en un catálogo curado a mano, donde las
marcas se dan de alta de una en una.

La subida va siempre desde el servidor con la service_role key, así que **no
hace falta ninguna policy de Storage**: el service role las salta todas. El
bucket `brands` se asume ya creado y público.

### Lo que NO incluye

Solo creación de marcas. No hay edición ni borrado de marcas o imágenes, ni
gestión de productos desde el admin, ni recuperación de contraseña. Si el
proyecto de Supabase tiene activada la confirmación por email, `signUp` no
devuelve sesión y el modal lo dice: hay que confirmar el correo antes de
poder acceder.

## Sistema de diseño

Lenguaje visual del handoff de Claude Design **"Marketplace Moda"** (brutalismo
limpio: Archivo 900 gigante, etiquetas mono, líneas de 1px, bloques negros
macizos, cero radio, cero sombra, sin acentos de color). Sustituye por completo
al sistema anterior basado en el teardown de Zara.com; lo que sobrevive de aquel
son las decisiones de **usabilidad y accesibilidad** que el proyecto tomó a
propósito, listadas más abajo.

### Tokens

Fuente de verdad única: las CSS variables de `app/globals.css`.
`tailwind.config.ts` solo las mapea a utilidades y `lib/motion.ts` las espeja en
el formato de Framer Motion. Los alias que ya usaba el markup (`ink`, `paper`,
`line`, `subtle`, `muted-text`, `tracking-ui`) siguen funcionando y apuntan a
los tokens nuevos.

| Grupo | Tokens |
| --- | --- |
| Color | `--bg` #FAFAF8 · `--fg` #0A0A0A · `--fg-hover` #151512 · `--border` #E4E4DF · `--muted-bg` #EFEFEB · texto `--text-2` #3A3A36 / `--text-3` #6B6B66 / `--text-4` #8A8A84 / `--text-5` #A8A8A2 |
| Tipografía | `--font-display` = `--font-ui` Archivo (400/700/800/900) · `--font-mono` IBM Plex Mono (400/500) · `--ui-size-base` 14px · trackings `display` −0.055em, `display-xl` −0.06em, `heading` −0.045em, `name` −0.02em, `mono` 0.14em, `mono-wide` 0.18em, `mono-widest` 0.22em |
| Escala fluida | `text-fluid-*` (`clamp()`): logo, hero, index, view, brand, cta, section, title, result, bento-full/wide/narrow, name, body |
| Espaciado | `--px-page` clamp(14px, 3.5vw, 28px) · `--py-section` clamp(34px, 7vw, 76px) · `--py-bar` clamp(18px, 3vw, 26px) · hit targets `min-h-hit` 44px, `min-h-cta` 48px, `min-h-cta-lg` 56px |
| Forma | `--radius` 0 · líneas de 1px · sin `box-shadow` |
| Movimiento | `--dur-fast` 200ms · `--dur-base` 400ms · `--dur-slow` 600ms · `--dur-zoom` 1100ms · `--ease` cubic-bezier(.22,.61,.36,1) |
| Header | `--header-h` 54px (94px en móvil, con la fila de género) |

Utilidades propias en `globals.css`: `.display` (Archivo 900, mayúsculas),
`.mono` (Plex Mono 14px, mayúsculas, tracking), `.text-outline` (texto
delineado que se rellena al hover), `.photo-reveal` (foto en b/n que pasa a
color al hover del `.group`; en color directamente sin puntero),
`.link-quiet` (enlace que se atenúa), `.placeholder-dark/-light` (rayado del
handoff para huecos sin foto), `.no-scrollbar`. Variante Tailwind `touch:`
(`@media (hover: none)`) para mostrar siempre lo que el handoff solo revela al
hover.

### Movimiento

- Una sola curva, la del handoff; nunca spring.
- Entradas: `fadeUp` de 14px (`ENTER_Y`) en vistas, cards y botones; `panelIn`
  (18px + escala .985, `PANEL_ENTER`) en modales.
- Hover de imagen: b/n → color en `--dur-slow` y zoom 1.05 (marca) / 1.04
  (producto) en `--dur-zoom`.
- Hero con parallax (`translateY = scrollY × 0.28`) y marquee continuo; ambos
  se anulan con `prefers-reduced-motion`, y el marquee se pausa al hover/foco.
  El marquee va con `useAnimationFrame` sobre un motion value en vez de un
  keyframe infinito precisamente para poder pausarlo sin salto.
- El drawer de filtros móvil es la única transición en CSS puro: es el mismo
  nodo que en desktop se queda `static` como sidebar, y Framer animaría `x`
  también ahí.

### Mapeo del handoff a las rutas

| Handoff | Ruta | Notas |
| --- | --- | --- |
| Home: índice + logo, hero, marquee, directorio, bento, CTA | `/` | El bento de 3 tarjetas se generaliza a N marcas en grupos de tres (fila completa + fila 68/32). La foto del hero es la de la primera marca con imagen, en b/n. |
| Tienda de marca | `/brands/[brandId]` | Banner + barra de sección + catálogo con filtros (el prototipo no tenía filtros por marca; aquí se conservan). |
| Catálogo global | `/products` | Sidebar sticky de 268px + barra de resultados + rejilla continua. Por debajo de `lg` el sidebar es un drawer. |
| Modal de producto | `/products/[productId]` | Misma anatomía (dos columnas, tallas, CTA "Comprar en la web oficial") pero como página con ruta propia. |
| Buscador full-screen | header | Busca solo marcas (nombre y dominio), como el prototipo. Se carga bajo demanda. |

### Desviaciones deliberadas respecto al handoff

| Handoff | Aquí | Motivo |
| --- | --- | --- |
| Etiquetas mono de 9–11px | 14px mínimo en toda la interfaz | Decisión de accesibilidad del proyecto, confirmada con el cliente |
| Texto a 42–55% de opacidad sobre negro | ≥ 70% | Contraste AA |
| Filtros escondidos tras `+` en móvil | Botón "Filtros / NN" siempre visible en la barra sticky | Usabilidad |
| Sin selector de género, sin densidad de rejilla, sin chips de filtros, sin scroll infinito | Se conservan, restilizados | Funcionalidad existente |
| Compra solo desde el modal | Además, botón ↗ en cada card | Funcionalidad existente |
| Sin estado de rebaja | Chip REBAJA en bloque negro y precio original tachado | El catálogo real tiene ofertas; sin acento de color, como pide el handoff |
| Hover como único descubridor del botón "Ver colección" / compra directa | Visibles siempre en dispositivos sin puntero (`touch:`) | No hay hover en táctil |

### Lo que se descartó del handoff

- **Filtrado en vivo de la home desde el buscador**: el overlay cubre la
  página al 94%, así que ese filtrado no se vería; la lista de resultados del
  propio overlay cumple la misma función.
- **Filtros de talla y color y contadores por opción**: los datos reales no
  tienen esas facetas normalizadas (ver "Swatches de color").
- **Copys de mock** ("COLECTIVO / ES", "FW26", "SCFFRS"…), fotografías
  placeholder y anotaciones `[ BANNER 1800×1100 ]`: nada de eso se copia.
- **Iconos**: ninguno externo; la lupa se construye en CSS y `✕ → ← ↗ ●`
  son caracteres, como en el prototipo.

## Notas de diseño

- **Filtros en la URL**: todos los filtros (género, categoría, precio,
  disponibilidad, oferta, marca, búsqueda) y el orden se reflejan como query
  params, para que las vistas se puedan compartir o recargar tal cual
  quedaron. La página cargada (scroll infinito) deliberadamente **no** se
  refleja en la URL.
- **Server Components primero, con Suspense**: el fetch inicial de
  marcas/productos ocurre en Server Components, envueltos en `<Suspense>`
  para que el layout (título, header) pinte antes de esperar a Supabase.
  `FilterToolbar`/`FilterDrawer`/`ActiveFilterChips` son componentes
  controlados que viven dentro de `ProductsExplorer`, el único sitio que
  llama a `useProductFilters`.
- **Cambios de filtro sin re-suspender**: `useProductFilters` envuelve la
  navegación (`router.push`) en `useTransition`. Gracias a eso, cambiar un
  filtro no vuelve a mostrar el fallback de `<Suspense>` (React mantiene el
  grid ya montado) — el feedback de "cargando" es el overlay + skeleton que
  pinta `ProductsExplorer` mientras `isPending` es `true`, sin tocar el
  scroll.
- **Scroll infinito**: `getProductsPage` pagina con `.range()` (páginas de
  48, `DEFAULT_PAGE_SIZE` en `lib/supabase/queries.ts`), pidiendo una fila de
  más para saber si hay siguiente página sin necesitar un `count` aparte. El
  Server Component solo trae la página 0; a partir de ahí,
  `useInfiniteProducts` + `useIntersectionObserver` (sentinel al final del
  grid) traen el resto **desde el cliente**, con `@supabase/supabase-js`
  cargado vía `import()` diferido para no penalizar el JS de la carga
  inicial. Al cambiar cualquier filtro/orden, `ProductGridInfinite` se
  remonta (`key` derivada de los filtros, ver `filtersKey`) y la paginación
  arranca limpia desde la página 0.
  - **Desempate de orden por `id`**: los `order()` de `getProductsPage`
    añaden siempre `id` como criterio secundario. Se verificó contra los
    datos reales que, sin esto, filas con el mismo `created_at` (lotes de
    scraping insertados en el mismo instante) o el mismo `current_price`
    hacían que `range()` devolviera productos duplicados entre páginas
    consecutivas — con el desempate, cero duplicados en varias páginas de
    prueba para los tres criterios de orden.
- **Columnas mínimas en el grid**: `getProductsPage`/`getProductsCount` solo
  piden lo necesario para pintar una card (`ProductListItem` en
  `lib/types/index.ts`) — nada de `description`, `attributes` ni `sizes`
  completos, que solo se traen en el detalle vía `getProductById`.
- **Drawer de filtros con preview antes de aplicar**: `FilterDrawer` guarda
  los cambios en un estado local ("draft") — no tocan la URL hasta pulsar
  "Ver X resultados". Mientras se ajustan filtros, un `useEffect` con
  debounce (300ms) llama a `getProductsCount` directamente desde el cliente
  (mismo patrón de `import()` diferido que el scroll infinito) para
  refrescar ese contador en vivo, sin aplicar nada hasta confirmar. "Borrar
  filtros" limpia solo los filtros del drawer — el género (barra global) y
  el orden (dropdown aparte) no se tocan.
- **Botón de compra directa**: cada card incluye un botón que abre
  `product_url` en pestaña nueva (`window.open(..., "noopener,noreferrer")`)
  sin navegar al detalle interno — usa `preventDefault`/`stopPropagation`
  porque, técnicamente, es un `<button>` anidado dentro del `<Link>` de la
  card (anidar un `<a>` real ahí sería HTML inválido).
- **Selector de tallas**: `sizesToOptions` (en `lib/types/index.ts`) lee la
  forma real de `sizes` (`{ size_label, available, stock_status, sku }[]`,
  confirmada contra la base) y conserva la disponibilidad por talla —
  `SizeGrid` la usa para atenuar/tachar las tallas sin stock en vez de
  quitarlas.
- **Loader de transición de ruta**: `RouteProgressBar` es una implementación
  propia (sin `next-nprogress-bar`) precisamente para poder distinguir con
  certeza una navegación de RUTA (pathname distinto — dispara la barra) de
  un cambio de filtro (mismo pathname, solo query params — no la dispara,
  porque ya tiene su propio overlay). Detecta el click en un `<a>` interno
  cuyo `href` apunta a otro pathname, arranca ahí mismo, y usa
  `usePathname()` para saber cuándo el contenido nuevo ya montó y así
  completarse/desvanecerse. El fade/slide de `PageTransition` usa
  `AnimatePresence mode="wait"` con `key={pathname}` (no `searchParams`), por
  la misma razón.
- **Tipos**: `lib/types/database.ts` sigue la forma que genera
  `supabase gen types typescript` para el esquema actual. Si el esquema de
  Supabase cambia, regenera con:

  ```bash
  supabase gen types typescript --project-id <project-id> > lib/types/database.ts
  ```

## Selector de género: heurístico, con cobertura parcial

El esquema **no tiene un campo de género estructurado** — se investigó a
fondo antes de construir nada (vía REST de Supabase, sobre miles de filas):

- `categories.name` es pura taxonomía de tipo de prenda (Camisetas,
  Sudaderas, Pantalones...); ninguna de las 33 categorías codifica género.
- `products.attributes` solo tiene tres claves consistentes en toda la
  tabla: `tags` (array de texto libre), `vendor` y `product_type`. No existe
  ninguna clave estructurada tipo `gender`/`genero`/`sex`.
- Sobre una muestra amplia de productos, la señal de género (palabras como
  "woman"/"man"/"mujer"/"hombre") solo aparece en `tags`/`product_type` para
  una fracción del catálogo, concentrada en un puñado de marcas — el resto
  de productos no tiene ninguna señal.

Dado que esta vez el encargo pedía explícitamente un selector global de
género (no un filtro más entre otros), se implementó como una **heurística
declarada**, no como un campo real:

- `attributes->>product_type` se compara con `imatch` (regex case-insensitive
  de PostgREST) usando límites de palabra (`\ypalabra\y`), para evitar falsos
  positivos como que "man" matchee dentro de "wo**man**" — se verificó
  explícitamente contra la base que sin el límite de palabra esto ocurría.
- `attributes->tags` se comprueba con `cs` (contains) buscando el token
  exacto como elemento del array (`["woman"]`, `["hombre"]`...), que no
  tiene el mismo problema porque no es un substring match.
- Ver `GENDER_OR_FILTER` en `lib/supabase/queries.ts` para el filtro exacto.

**Consecuencia para el usuario**: pestañas "Mujer"/"Hombre" filtran de forma
correcta y sin falsos positivos (verificado contra la base real), pero un
producto sin ninguna de esas palabras en `tags`/`product_type` no aparece en
ninguna de las dos pestañas — solo en "Todo". La cobertura es parcial por
diseño de los datos, no un bug; si se quiere cobertura completa, lo correcto
es añadir un campo `gender` real en el pipeline de scraping, no seguir
ampliando esta heurística.

## Swatches de color: no implementados (dato inexistente)

El punto del encargo que pedía mostrar círculos de color en la card se
comprobó contra la base antes de tocar código: `products.color_name` está
**vacío en el 100% de las filas** (0 de +15.000 productos), así que no hay
nada que mostrar desde ese campo. Existe una señal parecida a la del género
—palabras de color sueltas dentro de `attributes.tags` (`"PINK"`, `"BLUE"`,
`"CREAM"`...)— pero traerla habría significado meter `attributes` completo
(jsonb, con hasta 20-30 tags por producto) en el `select` del grid, algo que
contradice directamente el requisito, ya aplicado, de columnas mínimas en el
listado por rendimiento. Se priorizó esa regla sobre añadir swatches con un
dato que ni siquiera vive en el campo pensado para ello.

## Fuera de alcance (v1)

- `store_locations` está tipada pero no se usa todavía en ninguna vista.
- `category_keyword_rules`, `shop_category_mappings`, `scrape_runs` y
  `unclassified_products` no se usan en esta versión.
- Swatches de color en la card (ver sección anterior).
- Administración: solo alta de marcas. Sin edición ni borrado de marcas o
  imágenes, sin gestión de productos, sin UI de roles y sin recuperación de
  contraseña (ver "Autenticación y rol de administrador").
- Relevancia de género en el listado de marcas (`/`): las marcas no tienen
  un campo de género propio (una marca puede vender de todo), así que el
  selector global persiste al navegar pero no filtra `/` — solo `/products`
  y `/brands/[brandId]`, donde sí hay productos que filtrar.
