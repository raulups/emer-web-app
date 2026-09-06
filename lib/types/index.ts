import type { Database, Json } from "./database";

export type { Json } from "./database";

export type Brand = Database["public"]["Tables"]["brands"]["Row"];
export type BrandTag = Database["public"]["Enums"]["brand_tag"];

/**
 * Los tres tags, listados en el mismo orden de prioridad que aplica
 * `brand_tag_priority` en la base (popular 1, emergente 2, novedad 3). Ese
 * orden es el que se ofrece en el formulario de admin, para que se lea como
 * lo que es: una escala, no un conjunto suelto de etiquetas.
 */
export const BRAND_TAGS: { value: BrandTag; label: string }[] = [
  { value: "popular", label: "Popular" },
  { value: "emergente", label: "Emergente" },
  { value: "novedad", label: "Novedad" },
];

/**
 * Peso de cada tag en el orden del catálogo. Un número más bajo va antes.
 * Sin ninguno de estos tags, la marca cae al 4.
 */
export const BRAND_TAG_PRIORITY: Record<BrandTag, number> = {
  popular: 1,
  emergente: 2,
  novedad: 3,
};

/** Niveles posibles, en el orden en que se recorren. */
export const BRAND_PRIORITY_LEVELS = [1, 2, 3, 4] as const;

/**
 * Prioridad de una marca: la más alta (número más bajo) de sus tags, como
 * hace `min()` en SQL. Una marca con ["novedad","popular"] es prioridad 1.
 */
export function brandTagPriority(tags: BrandTag[] | null | undefined): number {
  if (!tags || tags.length === 0) return 4;
  const weights = tags.map((tag) => BRAND_TAG_PRIORITY[tag] ?? 4);
  return Math.min(...weights);
}

export function isBrandTag(value: unknown): value is BrandTag {
  return value === "popular" || value === "emergente" || value === "novedad";
}

/** Etiquetas legibles de una marca, en orden de prioridad. */
export function brandTagLabels(tags: BrandTag[] | null | undefined): string[] {
  if (!tags || tags.length === 0) return [];
  return BRAND_TAGS.filter((tag) => tags.includes(tag.value)).map((tag) => tag.label);
}
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductPriceHistoryEntry =
  Database["public"]["Tables"]["product_price_history"]["Row"];
export type StoreLocation =
  Database["public"]["Tables"]["store_locations"]["Row"];

/** Categoría con su lista de hijos directos ya resuelta, para render en árbol. */
export interface CategoryNode extends Category {
  children: CategoryNode[];
}

/** Producto con el `brand` embebido (join), usado en grids y detalle. */
export interface ProductWithBrand extends Product {
  brand: Pick<Brand, "id" | "name" | "color" | "logo"> | null;
}

/** Producto con `brand` y `category` embebidos, usado en la página de detalle. */
export interface ProductWithRelations extends ProductWithBrand {
  category: Pick<Category, "id" | "name" | "parent_id"> | null;
}

/**
 * Columnas mínimas necesarias para pintar una card en el grid: nada de
 * `description`/`attributes`/`sizes` completos, que solo hacen falta en el
 * detalle. `image_urls` se mantiene porque alimenta el crossfade de hover.
 */
export type ProductListItem = Pick<
  Product,
  | "id"
  | "brand_id"
  | "category_id"
  | "name"
  | "currency"
  | "current_price"
  | "original_price"
  | "is_on_sale"
  | "available"
  | "main_image_url"
  | "image_urls"
  | "product_url"
  | "created_at"
> & {
  brand: Pick<Brand, "id" | "name" | "color" | "logo"> | null;
  /**
   * Prioridad de tag de la marca (1 popular … 4 sin tag). La rellena
   * `getProductsPage` al recorrer los grupos de prioridad; es opcional
   * porque el detalle de producto no la necesita.
   */
  brand_tag_priority?: number;
};

/** Forma normalizada de `attributes` para renderizar como lista clave-valor. */
export type AttributeEntries = [key: string, value: string][];

export function isPlainObject(
  value: Json | null | undefined,
): value is { [key: string]: Json | undefined } {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

export function attributesToEntries(
  attributes: Json | null,
): AttributeEntries {
  if (!isPlainObject(attributes)) return [];
  return Object.entries(attributes)
    .filter((entry): entry is [string, Json] => entry[1] !== undefined)
    .map(([key, value]) => [key, formatAttributeValue(value)]);
}

function formatAttributeValue(value: Json): string {
  if (value === null) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map((v) => formatAttributeValue(v)).join(", ");
  }
  return Object.entries(value)
    .map(([k, v]) => `${k}: ${formatAttributeValue(v ?? null)}`)
    .join(", ");
}

/** Normaliza `sizes` (jsonb, forma variable) a una lista simple de strings. */
export function sizesToList(sizes: Json | null): string[] {
  if (sizes === null) return [];
  if (Array.isArray(sizes)) {
    return sizes
      .map((s) => {
        if (typeof s === "string") return s;
        if (typeof s === "number") return String(s);
        if (isPlainObject(s)) {
          const label = s.name ?? s.size ?? s.label ?? s.value;
          return typeof label === "string" || typeof label === "number"
            ? String(label)
            : null;
        }
        return null;
      })
      .filter((s): s is string => s !== null);
  }
  if (isPlainObject(sizes)) {
    return Object.keys(sizes);
  }
  return [];
}

/** Normaliza `image_urls` (jsonb) a una lista simple de URLs de string. */
export function imageUrlsToList(imageUrls: Json | null): string[] {
  if (!Array.isArray(imageUrls)) return [];
  return imageUrls.filter((u): u is string => typeof u === "string");
}

/** Una talla con su disponibilidad, para el selector en cuadrícula del detalle. */
export interface SizeOption {
  label: string;
  available: boolean;
}

/**
 * Normaliza `sizes` a `{label, available}[]`, conservando el stock (a
 * diferencia de `sizesToList`, que solo da las etiquetas). La forma real en
 * los datos es `{ size_label, available, stock_status, sku }[]`; se cae a
 * "disponible" por defecto si el objeto no trae esa información.
 */
export function sizesToOptions(sizes: Json | null): SizeOption[] {
  if (!Array.isArray(sizes)) {
    return sizesToList(sizes).map((label) => ({ label, available: true }));
  }
  return sizes
    .map((s): SizeOption | null => {
      if (typeof s === "string") return { label: s, available: true };
      if (typeof s === "number") return { label: String(s), available: true };
      if (isPlainObject(s)) {
        const label = s.size_label ?? s.name ?? s.size ?? s.label ?? s.value;
        if (typeof label !== "string" && typeof label !== "number") return null;
        const available =
          typeof s.available === "boolean"
            ? s.available
            : s.stock_status !== "out_of_stock";
        return { label: String(label), available };
      }
      return null;
    })
    .filter((s): s is SizeOption => s !== null);
}
