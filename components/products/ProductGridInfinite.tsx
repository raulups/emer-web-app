"use client";

import type { ProductListItem } from "@/lib/types";
import type { ProductFilters } from "@/lib/types/filters";
import { DEFAULT_GRID_DENSITY, type GridDensity } from "@/lib/types/grid";
import { useInfiniteProducts } from "@/hooks/useInfiniteProducts";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { ProductGrid } from "./ProductGrid";

interface ProductGridInfiniteProps {
  initialItems: ProductListItem[];
  initialHasMore: boolean;
  filters: ProductFilters;
  categoryIds?: string[];
  showBrand?: boolean;
  density?: GridDensity;
}

/**
 * Grid de productos con scroll infinito: la primera página llega ya
 * renderizada desde el servidor (`initialItems`); a partir de ahí, un
 * sentinel al final del grid dispara la carga de más páginas en cliente.
 *
 * Quien la monta debe darle una `key` distinta por combinación de
 * filtros/orden (ver ProductsExplorer) para que el cambio de filtros
 * resetee la paginación de golpe.
 */
export function ProductGridInfinite({
  initialItems,
  initialHasMore,
  filters,
  categoryIds,
  showBrand = false,
  density = DEFAULT_GRID_DENSITY,
}: ProductGridInfiniteProps) {
  const { items, hasMore, isLoadingMore, loadError, loadMore } =
    useInfiniteProducts({
      initialItems,
      initialHasMore,
      filters,
      categoryIds,
    });

  const sentinelRef = useIntersectionObserver(loadMore, {
    rootMargin: "600px 0px",
  });

  return (
    <div>
      <ProductGrid products={items} showBrand={showBrand} density={density} />

      {items.length > 0 ? (
        <div ref={sentinelRef}>
          {isLoadingMore ? <ProductGridSkeleton count={3} density={density} /> : null}

          {loadError ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="mono text-text-3">{loadError}</p>
              <button
                type="button"
                onClick={loadMore}
                className="mono link-quiet text-ink"
              >
                Reintentar
              </button>
            </div>
          ) : null}

          {!hasMore && !isLoadingMore && !loadError ? (
            <p className="mono py-8 text-center text-text-3">No hay más productos</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
