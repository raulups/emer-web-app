"use client";

import { useCallback, useRef, useState } from "react";
import type { ProductsPageResult } from "@/lib/supabase/queries";
import type { ProductListItem } from "@/lib/types";
import type { ProductFilters } from "@/lib/types/filters";

interface UseInfiniteProductsArgs {
  /** Primera página, ya resuelta en el Server Component. */
  initialItems: ProductListItem[];
  initialHasMore: boolean;
  filters: ProductFilters;
  categoryIds?: string[];
  pageSize?: number;
}

/**
 * Scroll infinito sobre productos: la página 0 llega por props (fetch en
 * servidor), y a partir de ahí este hook trae más páginas directamente desde
 * el cliente de Supabase (anon key, solo lectura) según el sentinel entra en
 * viewport. `filters`/`categoryIds` se consideran fijos durante la vida del
 * componente: quien lo usa debe montarlo con una `key` distinta por cada
 * combinación de filtros/orden para resetear la paginación de golpe.
 */
export function useInfiniteProducts({
  initialItems,
  initialHasMore,
  filters,
  categoryIds,
  pageSize = 48,
}: UseInfiniteProductsArgs) {
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const nextPageRef = useRef(1); // la página 0 ya llegó por props
  const isLoadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMore) return;
    isLoadingRef.current = true;
    setIsLoadingMore(true);
    setLoadError(null);
    try {
      // Import diferido: @supabase/supabase-js (y el cliente) solo se cargan
      // cuando de verdad hace falta traer una página extra, para no engordar
      // el JS de la carga inicial con algo que la mayoría de visitas ni usa.
      const [{ getProductsPage }, { supabase }] = await Promise.all([
        import("@/lib/supabase/queries"),
        import("@/lib/supabase/client"),
      ]);
      const result: ProductsPageResult = await getProductsPage(
        supabase,
        filters,
        categoryIds,
        { page: nextPageRef.current, pageSize },
      );
      setItems((prev) => [...prev, ...result.items]);
      setHasMore(result.hasMore);
      nextPageRef.current += 1;
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : "No se han podido cargar más productos.",
      );
    } finally {
      isLoadingRef.current = false;
      setIsLoadingMore(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore]);

  return { items, hasMore, isLoadingMore, loadError, loadMore };
}
