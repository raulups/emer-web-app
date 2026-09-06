/**
 * Densidad del grid de productos: tipo y constantes puras.
 *
 * Vive aquí y NO en `hooks/useGridDensity.ts` a propósito: ese módulo es
 * `"use client"`, y un Server Component que importe un valor de un módulo
 * cliente recibe una referencia opaca en vez del valor real (falla en build
 * con "You cannot dot into a client module from a server component").
 * `ProductGrid` y los skeletons son server, así que las constantes tienen
 * que estar en un módulo neutro como este.
 */
export type GridDensity = "compact" | "standard" | "wide";

export const GRID_DENSITIES: { value: GridDensity; label: string }[] = [
  { value: "compact", label: "Vista compacta" },
  { value: "standard", label: "Vista estándar" },
  { value: "wide", label: "Vista amplia" },
];

export const DEFAULT_GRID_DENSITY: GridDensity = "standard";

/**
 * Clases completas y estáticas (no interpoladas) para que Tailwind las vea
 * al escanear el código y no las purgue.
 */
export const GRID_DENSITY_CLASSES: Record<GridDensity, string> = {
  compact: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  standard: "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3",
  wide: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2",
};

export function isGridDensity(value: string | null): value is GridDensity {
  return value === "compact" || value === "standard" || value === "wide";
}
