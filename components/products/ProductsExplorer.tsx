"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Brand, Category, CategoryNode, ProductListItem } from "@/lib/types";
import {
  filtersKey,
  hasActiveDrawerFilters,
  serializeBrandIds,
} from "@/lib/types/filters";
import { DUR, EASE } from "@/lib/motion";
import { useProductFilters } from "@/hooks/useProductFilters";
import { useGridDensity } from "@/hooks/useGridDensity";
import { FilterToolbar } from "@/components/filters/FilterToolbar";
import { ActiveFilterChips } from "@/components/filters/ActiveFilterChips";
import { FilterDrawer } from "@/components/filters/FilterDrawer";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { ProductGridInfinite } from "./ProductGridInfinite";

interface ProductsExplorerProps {
  categoryTree: CategoryNode[];
  categories: Category[];
  brands?: Brand[];
  lockedBrandId?: string;
  initialItems: ProductListItem[];
  initialHasMore: boolean;
  totalCount: number;
  categoryIds?: string[];
  showBrand?: boolean;
}

/**
 * Cuerpo del catálogo (Vista 3 del handoff): sidebar de filtros de 268px
 * a la izquierda + contenido con barra sticky de resultados y rejilla
 * continua. Por debajo de `lg` el sidebar se convierte en un drawer que
 * abre el botón "Filtrar" de la barra.
 *
 * Es el único punto que llama a `useProductFilters`, para que todo comparta
 * la misma fuente de verdad (la URL) y el mismo `isPending` de la
 * transición.
 */
export function ProductsExplorer({
  categoryTree,
  categories,
  brands,
  lockedBrandId,
  initialItems,
  initialHasMore,
  totalCount,
  categoryIds,
  showBrand = false,
}: ProductsExplorerProps) {
  const { filters, setParams, isPending } = useProductFilters({
    brandId: lockedBrandId,
  });
  const { density, setDensity } = useGridDensity();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const gridKey = filtersKey(filters);
  const activeFilterCount =
    (filters.search ? 1 : 0) +
    (filters.categoryId ? 1 : 0) +
    (filters.minPrice !== undefined || filters.maxPrice !== undefined ? 1 : 0) +
    (filters.available ? 1 : 0) +
    (filters.onSale ? 1 : 0) +
    (filters.brandIds?.length ?? 0);

  return (
    <div className="grid lg:grid-cols-[268px_minmax(0,1fr)]">
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        categoryTree={categoryTree}
        categories={categories}
        brands={brands}
        lockedBrandId={lockedBrandId}
        committedFilters={filters}
        onApply={(draft) => {
          setParams({
            q: draft.search || undefined,
            category: draft.categoryId || undefined,
            minPrice: draft.minPrice !== undefined ? String(draft.minPrice) : undefined,
            maxPrice: draft.maxPrice !== undefined ? String(draft.maxPrice) : undefined,
            available: draft.available ? "true" : undefined,
            sale: draft.onSale ? "true" : undefined,
            brand: lockedBrandId ? undefined : serializeBrandIds(draft.brandIds ?? []),
          });
          setDrawerOpen(false);
        }}
        onClear={() => {
          // Solo limpia los filtros del panel — el género (barra global) y
          // el orden (dropdown aparte) no son parte de "Borrar filtros".
          setParams({
            q: undefined,
            category: undefined,
            minPrice: undefined,
            maxPrice: undefined,
            available: undefined,
            sale: undefined,
            brand: undefined,
          });
          setDrawerOpen(false);
        }}
      />

      <div className="min-w-0">
        <FilterToolbar
          resultCount={totalCount}
          activeFilterCount={activeFilterCount}
          sort={filters.sort}
          onSortChange={(sort) => setParams({ sort })}
          onOpenFilters={() => setDrawerOpen(true)}
          density={density}
          onDensityChange={setDensity}
        />

        {hasActiveDrawerFilters(filters) ? (
          <ActiveFilterChips
            filters={filters}
            categoryTree={categoryTree}
            brands={brands}
            onChange={setParams}
          />
        ) : null}

        <div className="relative" aria-busy={isPending}>
          <ProductGridInfinite
            key={gridKey}
            initialItems={initialItems}
            initialHasMore={initialHasMore}
            filters={filters}
            categoryIds={categoryIds}
            showBrand={showBrand}
            density={density}
          />

          <AnimatePresence>
            {isPending ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DUR.fast, ease: EASE }}
                className="absolute inset-0 z-[2] bg-paper/85"
              >
                <ProductGridSkeleton density={density} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
