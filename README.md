# Catálogo de marcas

Herramienta de exploración de un catálogo de marcas de ropa y sus productos.
No es un e-commerce (sin carrito ni checkout): es una app de solo lectura
sobre Supabase/PostgreSQL, pensada para escalar con más funcionalidades.
Estilo editorial minimalista inspirado en ZARA.com, incluyendo su patrón de
navegación (selector Mujer/Hombre, drawer de filtros).

## Stack

- **Next.js 14** (App Router) + TypeScript estricto
- **Tailwind CSS** — estilo minimalista/editorial (referencia: ZARA.com)
- **Supabase JS client** (`@supabase/supabase-js`) — solo lectura, vía anon key
- **Framer Motion** — transiciones de página, drawer, acordeones y micro-interacciones

## Estructura

```
/app
  /brands/[brandId]        Página de marca + sus productos
  /products                Vista global de productos
  /products/[productId]    Detalle de producto
/components
  /ui                      Botones, badges, inputs genéricos, AnimatedCounter,
                            RouteProgressBar, FadeInImage, skeletons
  /brands                  BrandCard, BrandGrid, BrandHeader (+ skeletons)
  /products                ProductCard/Grid, ProductGridInfinite,
                            ProductsExplorer (toolbar + chips + drawer + grid),
                            galería, atributos, tallas, histórico de precio...
  /filters                 FilterToolbar, FilterDrawer, GridDensityToggle,
                            acordeón de filtros,
                            árbol de categorías, slider de precio, checklist
                            de marca, chips de filtros activos, SortDropdown
  /layout                  SiteHeader (+ selector de género), PageTransition
/lib
  /supabase                Clientes (client/server) + queries tipadas
  /types                   Tipos derivados del esquema, tipos de filtros y
                            densidad de rejilla
  /utils                   Formateo (precio, fecha)
/hooks                     useProductFilters (URL + useTransition),
                            useInfiniteProducts, useIntersectionObserver,
                            useGenderQueryString, useDebouncedValue,
                            useGridDensity (persistida en localStorage)
/supabase/sql              Índices recomendados (ver más abajo)
```

## Setup

### 1. Requisitos

- Node.js 18.18+ (recomendado 20+)

### 2. Variables de entorno

Crea un archivo `.env.local` en la raíz (ya incluido en `.gitignore`) con:

```
NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
```

La app usa **exclusivamente la anon key pública**: no hay escritura, solo
lecturas (`SELECT`) sobre `brands`, `categories` y `products`. La `service_role`
/ `secret key` nunca debe usarse aquí — no es necesaria y comprometería la
base de datos si se filtrara al cliente.

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

Además, para que las queries de listado/paginación no se noten lentas al
crecer la tabla, corre también `supabase/sql/recommended_indexes.sql` en el
SQL editor (índices en `brand_id`, `category_id`, `created_at`,
`current_price` y `product_price_history.product_id`). La app solo tiene la
anon key, así que no puede ejecutar ese DDL por sí misma.

### 3. Instalar dependencias

```bash
npm install
```

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### 5. Otros comandos

```bash
npm run build       # build de producción
npm run start        # sirve el build de producción
npm run lint          # ESLint (next/core-web-vitals)
npm run typecheck   # tsc --noEmit
```

## Sistema de diseño

Lenguaje visual y de movimiento tipo ZARA.com adaptado a un catálogo (no a un
e-commerce). La regla de fondo: la app se compone como una revista de moda, no
como una herramienta de compra — restricción tipográfica y cromática extrema,
cero decoración, y movimiento que existe para que la imagen respire, nunca para
llamar la atención sobre sí mismo.

### Tokens

Fuente de verdad única: las CSS variables de `app/globals.css`.
`tailwind.config.ts` solo las mapea a utilidades (`bg-paper`, `text-ink`,
`text-ui`, `tracking-ui`, `duration-base`, `ease-zara`…), y `lib/motion.ts` las
espeja en el formato que necesita Framer Motion (segundos + arrays de bezier).
Cambiar un valor en `globals.css` lo propaga a CSS y a las animaciones a la vez.

| Grupo | Tokens |
| --- | --- |
| Color | `--bg` #FFF · `--fg` #000 · `--fg-inverse` #FFF · `--border` #E5E5E5 · `--muted` #999 · `--muted-text` #666 · `--accent` #C8102E · `--skeleton` #F7F7F7 |
| Tipografía | `--font-display` (Playfair Display) · `--font-ui` (Inter) · `--display-tracking` -0.05em · `--ui-tracking` 0.06em · `--ui-size-base` 14px · `--ui-line-height` 1.5 |
| Forma | `--radius` 0 · `--border-width` 1px · sin `box-shadow` en toda la app |
| Movimiento | `--dur-fast` 200ms · `--dur-base` 400ms · `--dur-slow` 600ms · `--ease` · `--ease-out` |

Reglas de aplicación:

- **Un solo peso** (400) para todo el chrome de interfaz. El 300 se reserva a
  nombres de producto; nunca bold fuera de `--font-display`.
- `--font-display` solo en el wordmark del header y en los titulares de página.
  Todo lo demás es `--font-ui` en mayúsculas con `--ui-tracking`.
- **CTAs**: texto subrayado (`.link-underline`) o borde de 1px. El relleno
  sólido negro (`<Button variant="solid">`) es la excepción funcional y está
  reservado a exactamente dos sitios: "Ver X resultados" del drawer y el botón
  de compra directa de la card.
- **El acento rojo solo aparece en rebajas**: precio de oferta (`PriceTag`) y
  chip "REBAJA" (`<Badge tone="sale">`). En ningún otro sitio.
- **Imagen a sangre**: en las cards, la imagen ocupa el 100% del contenedor sin
  padding interno y el texto va siempre *debajo*, fuera de ella. Lo único que se
  superpone es el chip de rebaja y el botón de compra directa. El hero de
  `/brands/[brandId]` va a sangre completa de viewport (`.bleed-full`, ~60vh) y
  el detalle da a la galería el 65% del ancho en desktop.

### Movimiento

- Nunca spring, nunca rebote, nunca overshoot: solo `--ease` (entradas, fades) y
  `--ease-out` (salidas).
- Desplazamiento máximo de entrada: **16px** (`ENTER_Y` = 12px en `lib/motion.ts`).
- Escala máxima en hover: **1.02** (el zoom de imagen de `ProductCard`/`BrandCard`).
- 200ms para estados tipográficos de hover, 400ms para fades de imagen y
  apertura de paneles, 600ms para la transición entre pantallas (`PageTransition`).
- El stagger del grid se calcula con `staggerDelay()`, con techo a 0.36s para que
  la última card no espere una cola larga.

### Carga de imágenes

`FadeInImage` (`components/ui/FadeInImage.tsx`) monta un placeholder por imagen
y hace un fade de opacidad 0→1 en `--dur-base` cuando esa imagen concreta
termina de descargar — un fade simple, deliberadamente no un blur-up. `onError`
también marca como cargada, para que un `src` roto no deje el placeholder
pulsando para siempre. Los skeletons de fetch (`components/ui/Skeleton.tsx`)
son un gris muy claro (`--skeleton`), nunca oscuro.

### Densidad de rejilla

`useGridDensity` expone tres densidades — compacta (4 columnas en desktop),
estándar (3) y amplia (2) — controladas desde `GridDensityToggle` en la barra
sticky y **persistidas en `localStorage`**. La preferencia se lee en un efecto
post-mount, no durante el render, porque leer `localStorage` en el primer render
rompería la hidratación; el acceso va en `try/catch` porque en modo privado el
propio acceso puede lanzar. Las clases de columnas son literales estáticos
(`GRID_DENSITY_CLASSES`) para que Tailwind no las purgue.

### Desviaciones deliberadas

Se adopta el lenguaje *estético* de Zara, no sus carencias de usabilidad. Lo que
se hace distinto, a propósito:

| Zara.com real | Aquí | Motivo |
| --- | --- | --- |
| Filtro y orden casi escondidos | Barra sticky visible con contador de resultados | Es la crítica de UX más repetida a su web |
| Texto blanco sobre imagen sin overlay | Hero de marca con gradiente + blur obligatorio | Contraste AA sobre cualquier imagen |
| Microtipografía por debajo de 14px | `--ui-size-base` 14px como mínimo absoluto | Legibilidad |
| Gris claro para texto secundario | `--muted-text` #666 en vez de `--muted` #999 | #999 sobre blanco da 2.85:1 y no llega a AA |
| Foco visible inconsistente | `:focus-visible` global de 2px en `--fg` | Navegación por teclado en toda la app |
| Sin skeletons de carga | Skeletons + fade-in por imagen | Percepción de velocidad con imágenes pesadas |
| Sin acceso directo a la tienda | Botón de compra directa en cada card | Es un catálogo, no un checkout |

Elementos **no clicables** (badges, etiquetas informativas) se distinguen
visualmente de los clicables: `Badge` es una caja plana sin hover ni subrayado,
mientras que todo lo interactivo lleva `.link-underline` o un borde que
reacciona al hover.

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
- Relevancia de género en el listado de marcas (`/`): las marcas no tienen
  un campo de género propio (una marca puede vender de todo), así que el
  selector global persiste al navegar pero no filtra `/` — solo `/products`
  y `/brands/[brandId]`, donde sí hay productos que filtrar.
