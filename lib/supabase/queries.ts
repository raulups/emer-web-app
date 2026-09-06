import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import type {
  Brand,
  Category,
  CategoryNode,
  Product,
  ProductListItem,
  ProductPriceHistoryEntry,
  ProductWithRelations,
} from "@/lib/types";
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

/** Todas las marcas, ordenadas alfabéticamente. */
export async function getBrands(client: Client): Promise<Brand[]> {
  const { data, error } = await client
    .from("brands")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(`Error al cargar marcas: ${error.message}`);
  return data ?? [];
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
 * Aplica los filtros combinables de producto (marca, categoría, precio,
 * disponibilidad, oferta, búsqueda) a una query ya iniciada con `.from("products")`.
 * Se usa tanto para paginar como para contar, así que no toca `.order`/`.range`.
 *
 * Nota: se repite (en vez de compartirse vía un helper genérico) el pequeño
 * bloque de condicionales en `getProductsPage`/`getProductsCount` porque el
 * tipo del builder de supabase-js encadena genéricos distintos según el
 * `select()` de partida (con o sin `head`), y forzar un tipo compartido es
 * más frágil que la duplicación de ~8 líneas.
 */

/**
 * Página de productos filtrados/ordenados, con la marca embebida y solo las
 * columnas necesarias para el grid. Usa `range()` para paginar; pide una fila
 * extra para saber si hay más sin necesitar un count aparte.
 */
export async function getProductsPage(
  client: Client,
  filters: ProductFilters,
  categoryIds: string[] | undefined,
  pagination: ProductPagination,
): Promise<ProductsPageResult> {
  const from = pagination.page * pagination.pageSize;
  const to = from + pagination.pageSize; // +1 fila para detectar hasMore

  let query = client.from("products").select(PRODUCT_LIST_SELECT).range(from, to);

  if (filters.brandId) {
    query = query.eq("brand_id", filters.brandId);
  } else if (filters.brandIds && filters.brandIds.length > 0) {
    query = query.in("brand_id", filters.brandIds);
  }
  if (categoryIds && categoryIds.length > 0) {
    query = query.in("category_id", categoryIds);
  } else if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }
  if (typeof filters.minPrice === "number") {
    query = query.gte("current_price", filters.minPrice);
  }
  if (typeof filters.maxPrice === "number") {
    query = query.lte("current_price", filters.maxPrice);
  }
  if (typeof filters.available === "boolean") {
    query = query.eq("available", filters.available);
  }
  if (typeof filters.onSale === "boolean") {
    query = query.eq("is_on_sale", filters.onSale);
  }
  if (filters.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }
  if (filters.gender) {
    query = query.or(GENDER_OR_FILTER[filters.gender]);
  }

  switch (filters.sort) {
    case "price_asc":
      query = query.order("current_price", { ascending: true, nullsFirst: true });
      break;
    case "price_desc":
      query = query.order("current_price", { ascending: false, nullsFirst: false });
      break;
    case "name_asc":
      query = query.order("name", { ascending: true });
      break;
    case "name_desc":
      query = query.order("name", { ascending: false });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }
  // Desempate por `id` (única, PK): sin esto, filas con el mismo
  // current_price/name/created_at —muy común aquí, hay lotes de scraping
  // insertados con el mismo timestamp— no tienen un orden estable entre
  // páginas, y `range()` puede devolver el mismo producto dos veces o
  // saltarse alguno al paginar. Verificado contra la tabla real: sin este
  // desempate, page0/page1 de 10 filas cada una llegaban a solaparse en 7.
  query = query.order("id", { ascending: true });

  const { data, error } = await query;
  if (error) throw new Error(`Error al cargar productos: ${error.message}`);

  const rows = (data ?? []) as unknown as ProductListItem[];
  const hasMore = rows.length > pagination.pageSize;
  return {
    items: hasMore ? rows.slice(0, pagination.pageSize) : rows,
    hasMore,
  };
}

/** Nº total de productos que matchean los filtros (sin orden/paginación). */
export async function getProductsCount(
  client: Client,
  filters: ProductFilters,
  categoryIds?: string[],
): Promise<number> {
  let query = client
    .from("products")
    .select("id", { count: "exact", head: true });

  if (filters.brandId) {
    query = query.eq("brand_id", filters.brandId);
  } else if (filters.brandIds && filters.brandIds.length > 0) {
    query = query.in("brand_id", filters.brandIds);
  }
  if (categoryIds && categoryIds.length > 0) {
    query = query.in("category_id", categoryIds);
  } else if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }
  if (typeof filters.minPrice === "number") {
    query = query.gte("current_price", filters.minPrice);
  }
  if (typeof filters.maxPrice === "number") {
    query = query.lte("current_price", filters.maxPrice);
  }
  if (typeof filters.available === "boolean") {
    query = query.eq("available", filters.available);
  }
  if (typeof filters.onSale === "boolean") {
    query = query.eq("is_on_sale", filters.onSale);
  }
  if (filters.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }
  if (filters.gender) {
    query = query.or(GENDER_OR_FILTER[filters.gender]);
  }

  const { count, error } = await query;
  if (error) throw new Error(`Error al contar productos: ${error.message}`);
  return count ?? 0;
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

/** Productos de una marca (uso puntual, sin filtros extra). */
export async function getProductsByBrand(
  client: Client,
  brandId: string,
): Promise<Product[]> {
  const { data, error } = await client
    .from("products")
    .select("*")
    .eq("brand_id", brandId);

  if (error) throw new Error(`Error al cargar productos: ${error.message}`);
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
