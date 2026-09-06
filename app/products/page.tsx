import type { Metadata } from "next";
import { Suspense } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  DEFAULT_PAGE_SIZE,
  buildCategoryTree,
  getBrands,
  getCategories,
  getCategoryDescendantIds,
  getProductsCount,
  getProductsPage,
} from "@/lib/supabase/queries";
import { parseProductFilters, type FilterSearchParams } from "@/lib/types/filters";
import { padCount } from "@/lib/utils/format";
import { ProductsExplorer } from "@/components/products/ProductsExplorer";
import { ProductsExplorerSkeleton } from "@/components/products/ProductsExplorerSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";

export const metadata: Metadata = { title: "Productos" };

interface ProductsPageProps {
  searchParams: FilterSearchParams;
}

/**
 * Catálogo global (Vista 3 del handoff): cabecera con el titular gigante
 * y la meta mono a la derecha; debajo, sidebar + rejilla.
 */
export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <div>
      {/*
        Suspense deja pintar el título antes de esperar a Supabase, solo en
        la primera carga real de la ruta. Los cambios de filtro navegan vía
        useProductFilters con `startTransition`, así que React NO vuelve a
        mostrar este fallback en cada cambio — el feedback de esos cambios
        es el overlay de ProductsExplorer, no este skeleton.
      */}
      <Suspense fallback={<ProductsPageSkeleton />}>
        <ProductsData searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function CatalogHeader({ meta }: { meta: React.ReactNode }) {
  return (
    <section className="grid items-end gap-[clamp(14px,3vw,28px)] border-b border-line px-page pb-bar pt-[clamp(34px,6vw,54px)] lg:grid-cols-[minmax(0,1fr)_auto]">
      <h1 className="display text-fluid-view tracking-display">
        Todos los
        <br />
        productos
      </h1>
      <div className="mono text-text-3 lg:text-right">{meta}</div>
    </section>
  );
}

function ProductsPageSkeleton() {
  return (
    <div>
      <CatalogHeader meta={<Skeleton className="h-4 w-48" />} />
      <ProductsExplorerSkeleton />
    </div>
  );
}

async function ProductsData({ searchParams }: ProductsPageProps) {
  const client = createServerSupabaseClient();

  const [brands, categories] = await Promise.all([
    getBrands(client),
    getCategories(client),
  ]);

  const filters = parseProductFilters(searchParams);
  const categoryIds = filters.categoryId
    ? getCategoryDescendantIds(filters.categoryId, categories)
    : undefined;

  const [{ items, hasMore }, totalCount] = await Promise.all([
    getProductsPage(client, filters, categoryIds, {
      page: 0,
      pageSize: DEFAULT_PAGE_SIZE,
    }),
    getProductsCount(client, filters, categoryIds),
  ]);

  const categoryTree = buildCategoryTree(categories);

  return (
    <div>
      <CatalogHeader
        meta={`Índice global · ${padCount(brands.length)} ${brands.length === 1 ? "marca" : "marcas"}`}
      />
      <ProductsExplorer
        categoryTree={categoryTree}
        categories={categories}
        brands={brands}
        initialItems={items}
        initialHasMore={hasMore}
        totalCount={totalCount}
        categoryIds={categoryIds}
        showBrand
      />
    </div>
  );
}
