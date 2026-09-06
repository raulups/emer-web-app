export type SortOption =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "name_asc"
  | "name_desc";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Más recientes" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
  { value: "name_asc", label: "Nombre: A-Z" },
  { value: "name_desc", label: "Nombre: Z-A" },
];

export const DEFAULT_SORT: SortOption = "newest";

export function isSortOption(value: string | null): value is SortOption {
  return (
    value === "newest" ||
    value === "price_asc" ||
    value === "price_desc" ||
    value === "name_asc" ||
    value === "name_desc"
  );
}

/**
 * Selector global Mujer/Hombre. No hay valor para "unisex": los datos no
 * distinguen esa categoría (ver README, sección "Selector de género") — sin
 * `gender` en la URL se interpreta como "todo".
 */
export type GenderOption = "woman" | "man";

export const GENDER_OPTIONS: { value: GenderOption; label: string }[] = [
  { value: "woman", label: "Mujer" },
  { value: "man", label: "Hombre" },
];

export function isGenderOption(
  value: string | null | undefined,
): value is GenderOption {
  return value === "woman" || value === "man";
}

/** Límites razonables para el slider de precio (datos reales: 0 – ~2100). */
export const PRICE_BOUNDS = { min: 0, max: 2000 };

/** Filtros de producto tal y como se aplican en las queries de Supabase. */
export interface ProductFilters {
  /** Marca fija por ruta (/brands/[brandId]) — no es un filtro elegible por el usuario. */
  brandId?: string;
  /** Marcas elegidas en el checklist del drawer (solo tiene sentido en /products). */
  brandIds?: string[];
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  available?: boolean;
  onSale?: boolean;
  search?: string;
  gender?: GenderOption;
  sort: SortOption;
}

/** Nombres de query params en la URL, compartidos entre server y client. */
export const FILTER_PARAM = {
  search: "q",
  category: "category",
  minPrice: "minPrice",
  maxPrice: "maxPrice",
  available: "available",
  sale: "sale",
  brand: "brand",
  gender: "gender",
  sort: "sort",
} as const;

/** Nombre de query param válido, para tipar los patches de actualización de URL. */
export type FilterParamKey = (typeof FILTER_PARAM)[keyof typeof FILTER_PARAM];

/** Patch parcial de query params, tal y como lo consumen setParams/onChange. */
export type FilterParamsPatch = Partial<Record<FilterParamKey, string | undefined>>;

export type FilterSearchParams = {
  [FILTER_PARAM.search]?: string;
  [FILTER_PARAM.category]?: string;
  [FILTER_PARAM.minPrice]?: string;
  [FILTER_PARAM.maxPrice]?: string;
  [FILTER_PARAM.available]?: string;
  [FILTER_PARAM.sale]?: string;
  [FILTER_PARAM.brand]?: string;
  [FILTER_PARAM.gender]?: string;
  [FILTER_PARAM.sort]?: string;
};

function parseBooleanParam(value: string | undefined): boolean | undefined {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

function parseNumberParam(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** `brand=id1,id2,id3` -> ["id1","id2","id3"] (vacío/ausente -> undefined). */
function parseBrandIdsParam(value: string | undefined): string[] | undefined {
  if (!value) return undefined;
  const ids = value.split(",").map((id) => id.trim()).filter(Boolean);
  return ids.length > 0 ? ids : undefined;
}

export function serializeBrandIds(ids: string[]): string | undefined {
  return ids.length > 0 ? ids.join(",") : undefined;
}

/**
 * Convierte los searchParams de una page (server) en un objeto de filtros
 * tipado, listo para pasar a las queries. `brandId` opcional se puede forzar
 * (p.ej. en /brands/[brandId], donde viene de la ruta, no de la URL) — en
 * ese caso el query param `brand` se ignora (no tiene sentido elegir marca
 * dentro de la propia marca).
 */
export function parseProductFilters(
  searchParams: FilterSearchParams,
  overrides?: { brandId?: string },
): ProductFilters {
  const sortParam = searchParams[FILTER_PARAM.sort] ?? null;
  const lockedBrandId = overrides?.brandId;
  return {
    brandId: lockedBrandId,
    brandIds: lockedBrandId
      ? undefined
      : parseBrandIdsParam(searchParams[FILTER_PARAM.brand]),
    categoryId: searchParams[FILTER_PARAM.category] || undefined,
    minPrice: parseNumberParam(searchParams[FILTER_PARAM.minPrice]),
    maxPrice: parseNumberParam(searchParams[FILTER_PARAM.maxPrice]),
    available: parseBooleanParam(searchParams[FILTER_PARAM.available]),
    onSale: parseBooleanParam(searchParams[FILTER_PARAM.sale]),
    search: searchParams[FILTER_PARAM.search] || undefined,
    gender: isGenderOption(searchParams[FILTER_PARAM.gender])
      ? (searchParams[FILTER_PARAM.gender] as GenderOption)
      : undefined,
    sort: isSortOption(sortParam) ? sortParam : DEFAULT_SORT,
  };
}

/**
 * Clave estable derivada de los filtros activos, para usar como `key` de
 * remount del grid de scroll infinito: al cambiar cualquier filtro/orden la
 * key cambia, el grid se remonta y la paginación arranca limpia desde la
 * página 0 en vez de mezclar resultados de dos búsquedas distintas.
 */
export function filtersKey(filters: ProductFilters): string {
  return [
    filters.brandId ?? "",
    (filters.brandIds ?? []).slice().sort().join(","),
    filters.categoryId ?? "",
    filters.minPrice ?? "",
    filters.maxPrice ?? "",
    filters.available ?? "",
    filters.onSale ?? "",
    filters.search ?? "",
    filters.gender ?? "",
    filters.sort,
  ].join("|");
}

/** true si hay algún filtro (no orden/género, que viven fuera del drawer) activo. */
export function hasActiveDrawerFilters(filters: ProductFilters): boolean {
  return (
    Boolean(filters.search) ||
    Boolean(filters.categoryId) ||
    Boolean(filters.minPrice) ||
    Boolean(filters.maxPrice) ||
    typeof filters.available === "boolean" ||
    typeof filters.onSale === "boolean" ||
    Boolean(filters.brandIds && filters.brandIds.length > 0)
  );
}
