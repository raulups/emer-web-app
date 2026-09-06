import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import type {
  Brand,
  Category,
  CategoryNode,
  ProductListItem,
  ProductPriceHistoryEntry,
  ProductWithRelations,
} from "@/lib/types";
import { BRAND_PRIORITY_LEVELS, brandTagPriority } from "@/lib/types";
import type { ProductFilters } from "@/lib/types/filters";

// Sin `server-only`: estas funciones solo reciben un cliente Supabase ya
// construido (anon key, solo lectura) y las usa tanto el Server Component
// del fetch inicial como el scroll infinito en cliente (lib/supabase/client.ts).

type Client = SupabaseClient<Database>;

const BRAND_SUMMARY_SELECT = "id, name, color, logo";
const CATEGORY_SUMMARY_SELECT = "id, name, parent_id";

/**
 * Columnas mínimas para el grid: sin `description`, `attributes` ni `sizes`
 * completos (eso solo se trae en el detalle vía getProductById).
 * `product_url` se incluye porque alimenta el botón de compra directa.
 */
const PRODUCT_LIST_SELECT = `
  id, brand_id, category_id, name, currency, current_price, original_price,
  is_on_sale, available, main_image_url, image_urls, product_url, created_at,
  brand:brands(${BRAND_SUMMARY_SELECT})
`;

/**
 * Filtro heurístico de género: el esquema NO tiene un campo de género
 * estructurado (ver README, "Selector de género"). Se aproxima buscando
 * palabras de género completas (con límite de palabra vía `imatch`, para
 * que "man" no matchee dentro de "woman") en `attributes.product_type`, y
 * coincidencias exactas de elemento en el array `attributes.tags`.
 * Cobertura parcial: solo una fracción de los productos trae esta señal —
 * el resto no aparece en ninguna de las dos pestañas.
 */
const GENDER_OR_FILTER: Record<"woman" | "man", string> = {
  woman: [
    "attributes->>product_type.imatch.\\ywoman\\y",
    "attributes->>product_type.imatch.\\ywomen\\y",
    "attributes->>product_type.imatch.\\yfemale\\y",
    "attributes->>product_type.imatch.\\ymujer\\y",
    'attributes->tags.cs.["woman"]',
    'attributes->tags.cs.["women"]',
    'attributes->tags.cs.["female"]',
    'attributes->tags.cs.["mujer"]',
  ].join(","),
  man: [
    "attributes->>product_type.imatch.\\yman\\y",
    "attributes->>product_type.imatch.\\ymen\\y",
    "attributes->>product_type.imatch.\\ymale\\y",
    "attributes->>product_type.imatch.\\yhombre\\y",
    'attributes->tags.cs.["man"]',
    'attributes->tags.cs.["men"]',
    'attributes->tags.cs.["male"]',
    'attributes->tags.cs.["hombre"]',
  ].join(","),
};

/**
 * Todas las marcas, ordenadas por prioridad de tag (popular → emergente →
 * novedad → sin tag) y, dentro de cada grupo, de más reciente a más antigua.
 *
 * El orden se resuelve EN LA APLICACIÓN, no en SQL: `tags` es un array de
 * enum y PostgREST no sabe ordenar por una expresión sobre él. Son ~30 filas
 * que ya se traen enteras, así que ordenarlas aquí no cuesta nada y evita
 * depender de una columna generada en la base. El desempate final por `id`
 * mantiene estable el orden entre marcas creadas en el mismo instante (los
 * lotes de alta comparten `created_at`).
 */
export async function getBrands(client: Client): Promise<Brand[]> {
  const { data, error } = await client.from("brands").select("*");

  if (error) throw new Error(`Error al cargar marcas: ${error.message}`);

  return (data ?? []).slice().sort(compareBrandsByPriority);
}

/** popular → emergente → novedad → sin tag; luego más reciente; luego id. */
function compareBrandsByPriority(a: Brand, b: Brand): number {
  const priority = brandTagPriority(a.tags) - brandTagPriority(b.tags);
  if (priority !== 0) return priority;

  const recency = b.created_at.localeCompare(a.created_at);
  if (recency !== 0) return recency;

  return a.id.localeCompare(b.id);
}

/** Una marca por id, o null si no existe. */
export async function getBrandById(
  client: Client,
  brandId: string,
): Promise<Brand | null> {
  const { data, error } = await client
    .from("brands")
    .select("*")
    .eq("id", brandId)
    .maybeSingle();

  if (error) throw new Error(`Error al cargar la marca: ${error.message}`);
  return data;
}

/** Todas las categorías, sin procesar. */
export async function getCategories(client: Client): Promise<Category[]> {
  const { data, error } = await client
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(`Error al cargar categorías: ${error.message}`);
  return data ?? [];
}

/** Construye el árbol de categorías a partir de la lista plana (parent_id). */
export function buildCategoryTree(categories: Category[]): CategoryNode[] {
  const nodeById = new Map<string, CategoryNode>(
    categories.map((c) => [c.id, { ...c, children: [] }]),
  );
  const roots: CategoryNode[] = [];

  for (const category of categories) {
    const node = nodeById.get(category.id);
    if (!node) continue;
    if (category.parent_id && nodeById.has(category.parent_id)) {
      nodeById.get(category.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

/** Ids de una categoría más todos sus descendientes (para filtrar por jerarquía). */
export function getCategoryDescendantIds(
  categoryId: string,
  categories: Category[],
): string[] {
  const childrenByParent = new Map<string, string[]>();
  for (const category of categories) {
    if (!category.parent_id) continue;
    const siblings = childrenByParent.get(category.parent_id) ?? [];
    siblings.push(category.id);
    childrenByParent.set(category.parent_id, siblings);
  }

  const result: string[] = [categoryId];
  const queue = [categoryId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    const children = childrenByParent.get(current) ?? [];
    for (const childId of children) {
      result.push(childId);
      queue.push(childId);
    }
  }
  return result;
}

export interface ProductPagination {
  /** Página 0-indexada. */
  page: number;
  pageSize: number;
}

export interface ProductsPageResult {
  items: ProductListItem[];
  hasMore: boolean;
}

export const DEFAULT_PAGE_SIZE = 48;

/**
 * Ámbito de una consulta de productos. `brandIds` sustituye por completo a
 * `filters.brandId`/`filters.brandIds` cuando se recorre un grupo de
 * prioridad concreto.
 */
interface ProductScope {
  filters: ProductFilters;
  categoryIds?: string[];
  brandIds?: string[];
}

/**
 * Aplica el filtro de marca del ámbito. Se separa porque es el único que
 * cambia entre la consulta normal y la de un grupo de prioridad.
 */
function brandFilterOf(scope: ProductScope): { column: "brand_id"; ids: string[] } | { column: "brand_id"; id: string } | null {
  if (scope.brandIds) return { column: "brand_id", ids: scope.brandIds };
  if (scope.filters.brandId) return { column: "brand_id", id: scope.filters.brandId };
  if (scope.filters.brandIds && scope.filters.brandIds.length > 0) {
    return { column: "brand_id", ids: scope.filters.brandIds };
  }
  return null;
}

/**
 * Filtros combinables de producto (marca, categoría, precio, disponibilidad,
 * oferta, búsqueda, género). No toca `.order`/`.range`.
 *
 * El builder se tipa como `any` a propósito: supabase-js encadena genéricos
 * distintos según el `select()` de partida (con o sin `head`), y compartir
 * un tipo entre ambos casos es más frágil que este único punto sin tipar,
 * que además está encapsulado aquí dentro.
 */
function applyProductFilters<Q>(query: Q, scope: ProductScope): Q {
  const { filters, categoryIds } = scope;
  let q = query as any;

  const brand = brandFilterOf(scope);
  if (brand) {
    q = "ids" in brand ? q.in(brand.column, brand.ids) : q.eq(brand.column, brand.id);
  }
  if (categoryIds && categoryIds.length > 0) {
    q = q.in("category_id", categoryIds);
  } else if (filters.categoryId) {
    q = q.eq("category_id", filters.categoryId);
  }
  if (typeof filters.minPrice === "number") {
    q = q.gte("current_price", filters.minPrice);
  }
  if (typeof filters.maxPrice === "number") {
    q = q.lte("current_price", filters.maxPrice);
  }
  if (typeof filters.available === "boolean") {
    q = q.eq("available", filters.available);
  }
  if (typeof filters.onSale === "boolean") {
    q = q.eq("is_on_sale", filters.onSale);
  }
  if (filters.search) {
    q = q.ilike("name", `%${filters.search}%`);
  }
  if (filters.gender) {
    q = q.or(GENDER_OR_FILTER[filters.gender]);
  }
  return q as Q;
}

/** Orden del criterio elegido en el selector, dentro de un mismo grupo. */
function applyProductOrder<Q>(query: Q, sort: ProductFilters["sort"]): Q {
  let q = query as any;
  switch (sort) {
    case "price_asc":
      q = q.order("current_price", { ascending: true, nullsFirst: true });
      break;
    case "price_desc":
      q = q.order("current_price", { ascending: false, nullsFirst: false });
      break;
    case "name_asc":
      q = q.order("name", { ascending: true });
      break;
    case "name_desc":
      q = q.order("name", { ascending: false });
      break;
    case "newest":
    default:
      q = q.order("created_at", { ascending: false });
      break;
  }
  // Desempate por `id` (única, PK): sin esto, filas con el mismo
  // current_price/name/created_at —muy común aquí, hay lotes de scraping
  // insertados con el mismo timestamp— no tienen un orden estable entre
  // páginas, y `range()` puede devolver el mismo producto dos veces o
  // saltarse alguno al paginar. Verificado contra la tabla real: sin este
  // desempate, page0/page1 de 10 filas cada una llegaban a solaparse en 7.
  return q.order("id", { ascending: true }) as Q;
}

/** Un tramo de productos del ámbito dado. */
async function fetchProducts(
  client: Client,
  scope: ProductScope,
  offset: number,
  limit: number,
): Promise<ProductListItem[]> {
  let query = client.from("products").select(PRODUCT_LIST_SELECT);
  query = applyProductFilters(query, scope);
  query = applyProductOrder(query, scope.filters.sort);

  const { data, error } = await query.range(offset, offset + limit - 1);
  if (error) throw new Error(`Error al cargar productos: ${error.message}`);
  return (data ?? []) as unknown as ProductListItem[];
}

/** Nº de productos del ámbito dado. */
async function countProducts(client: Client, scope: ProductScope): Promise<number> {
  const query = applyProductFilters(
    client.from("products").select("id", { count: "exact", head: true }),
    scope,
  );

  const { count, error } = await query;
  if (error) throw new Error(`Error al contar productos: ${error.message}`);
  // Esta consulta va por HEAD y ahí supabase-js entrega algunos fallos como
  // `{ count: null, error: null }`: un recuento correcto siempre trae un
  // número, así que un null es un fallo silencioso, no un cero.
  if (count === null) {
    throw new Error("Error al contar productos: la respuesta no incluyó el recuento.");
  }
  return count;
}

/**
 * Ids de marca agrupados por prioridad de tag, en orden (popular primero).
 * Los grupos vacíos se descartan. Si el usuario ha filtrado por marcas
 * concretas, solo se consideran esas.
 */
async function getBrandPriorityGroups(
  client: Client,
  onlyBrandIds?: string[],
): Promise<{ priority: number; brandIds: string[] }[]> {
  const { data, error } = await client.from("brands").select("id, tags");
  if (error) throw new Error(`Error al cargar marcas: ${error.message}`);

  const allowed =
    onlyBrandIds && onlyBrandIds.length > 0 ? new Set(onlyBrandIds) : null;

  return BRAND_PRIORITY_LEVELS.map((priority) => ({
    priority,
    brandIds: (data ?? [])
      .filter((brand) => !allowed || allowed.has(brand.id))
      .filter((brand) => brandTagPriority(brand.tags) === priority)
      .map((brand) => brand.id),
  })).filter((group) => group.brandIds.length > 0);
}

/**
 * Página de productos filtrados/ordenados, con la marca embebida y solo las
 * columnas necesarias para el grid.
 *
 * Con el criterio por defecto ("Más recientes") el catálogo se ordena por
 * PRIORIDAD DE TAG DE LA MARCA: primero todos los productos de marcas
 * `popular`, luego `emergente`, luego `novedad` y por último las marcas sin
 * tag; dentro de cada grupo, lo más reciente primero.
 *
 * Ese orden no se puede pedir a PostgREST en una sola consulta —no sabe
 * ordenar la tabla padre por una columna de la tabla embebida—, así que se
 * recorren los grupos en orden y se pagina a través de ellos: para la
 * ventana [from, from+pageSize] se cuenta cada grupo hasta encontrar dónde
 * cae, y se piden solo las filas necesarias. En la práctica casi todas las
 * páginas se resuelven dentro del primer grupo (1 recuento + 1 consulta).
 *
 * Los demás criterios del selector (precio, nombre) ordenan solo por su
 * campo, sin agrupar por prioridad, así que van por el camino directo.
 */
export async function getProductsPage(
  client: Client,
  filters: ProductFilters,
  categoryIds: string[] | undefined,
  pagination: ProductPagination,
): Promise<ProductsPageResult> {
  const from = pagination.page * pagination.pageSize;
  const need = pagination.pageSize + 1; // fila extra para detectar hasMore

  // Con una marca fija (/brands/[brandId]) todos los productos comparten
  // prioridad, así que agrupar no aportaría nada.
  const groupByPriority = filters.sort === "newest" && !filters.brandId;

  if (!groupByPriority) {
    const rows = await fetchProducts(client, { filters, categoryIds }, from, need);
    return toPageResult(rows, pagination.pageSize);
  }

  const groups = await getBrandPriorityGroups(client, filters.brandIds);
  const items: ProductListItem[] = [];
  let consumed = 0; // filas de los grupos ya recorridos por completo

  for (const group of groups) {
    if (items.length >= need) break;

    const scope: ProductScope = { filters, categoryIds, brandIds: group.brandIds };
    const total = await countProducts(client, scope);
    if (total === 0) continue;

    // La ventana empieza después de este grupo entero: se salta.
    if (from >= consumed + total) {
      consumed += total;
      continue;
    }

    const rows = await fetchProducts(
      client,
      scope,
      Math.max(0, from - consumed),
      need - items.length,
    );
    for (const row of rows) {
      items.push({ ...row, brand_tag_priority: group.priority });
    }
    consumed += total;
  }

  return toPageResult(items, pagination.pageSize);
}

function toPageResult(rows: ProductListItem[], pageSize: number): ProductsPageResult {
  const hasMore = rows.length > pageSize;
  return { items: hasMore ? rows.slice(0, pageSize) : rows, hasMore };
}

/** Nº total de productos que matchean los filtros (sin orden/paginación). */
export async function getProductsCount(
  client: Client,
  filters: ProductFilters,
  categoryIds?: string[],
): Promise<number> {
  return countProducts(client, { filters, categoryIds });
}

/** Un producto por id, con marca y categoría embebidas (ficha completa). */
export async function getProductById(
  client: Client,
  productId: string,
): Promise<ProductWithRelations | null> {
  const { data, error } = await client
    .from("products")
    .select(
      `*, brand:brands(${BRAND_SUMMARY_SELECT}), category:categories(${CATEGORY_SUMMARY_SELECT})`,
    )
    .eq("id", productId)
    .maybeSingle();

  if (error) throw new Error(`Error al cargar el producto: ${error.message}`);
  return data as unknown as ProductWithRelations | null;
}

/** Histórico de precio de un producto, ordenado cronológicamente. */
export async function getProductPriceHistory(
  client: Client,
  productId: string,
): Promise<ProductPriceHistoryEntry[]> {
  const { data, error } = await client
    .from("product_price_history")
    .select("*")
    .eq("product_id", productId)
    .order("scraped_at", { ascending: true });

  if (error) {
    throw new Error(`Error al cargar el histórico de precio: ${error.message}`);
  }
  return data ?? [];
}

/** Nº total de productos de una marca, sin aplicar filtros (para la cabecera). */
export async function getBrandProductCount(
  client: Client,
  brandId: string,
): Promise<number> {
  const { count, error } = await client
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("brand_id", brandId);

  if (error) throw new Error(`Error al contar productos: ${error.message}`);
  return count ?? 0;
}
