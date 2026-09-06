"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_GRID_DENSITY, isGridDensity, type GridDensity } from "@/lib/types/grid";

const STORAGE_KEY = "catalog:grid-density";

/**
 * Densidad del grid de productos, persistida en localStorage.
 *
 * Arranca siempre en el valor por defecto y lee la preferencia guardada en
 * un efecto (post-mount), no en el primer render: leer localStorage durante
 * el render rompería la hidratación al no coincidir con el HTML del
 * servidor. El acceso va en try/catch porque en modo privado o con las
 * cookies bloqueadas el propio acceso puede lanzar.
 *
 * El tipo y las constantes viven en `lib/types/grid.ts` (módulo neutro), no
 * aquí: este archivo es `"use client"` y los Server Components que pintan el
 * grid necesitan esos valores de verdad, no una referencia de cliente.
 */
export function useGridDensity() {
  const [density, setDensity] = useState<GridDensity>(DEFAULT_GRID_DENSITY);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isGridDensity(stored)) setDensity(stored);
    } catch {
      // Sin persistencia disponible: se queda con el valor por defecto.
    }
  }, []);

  const changeDensity = useCallback((next: GridDensity) => {
    setDensity(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignorado a propósito: la preferencia es una comodidad, no un dato.
    }
  }, []);

  return { density, setDensity: changeDensity };
}
