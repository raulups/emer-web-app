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
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductsExplorer } from "@/components/products/ProductsExplorer";
import { ProductsExplorerSkeleton } from "@/components/products/ProductsExplorerSkeleton";

export const metadata: Metadata = { title: "Productos" };

interface ProductsPageProps {
  searchParams: FilterSearchParams;
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <PageContainer>
      <div className="mb-10 border-b border-line pb-8">
        <h1 className="font-display text-4xl tracking-display text-ink sm:text-6xl">
          Productos
        </h1>
      </div>
      {/*
        Suspense deja pintar el título antes de esperar a Supabase, solo en
        la primera carga real de la ruta. Los cambios de filtro navegan vía
        useProductFilters con `startTransition`, así que React NO vuelve a
        mostrar este fallback en cada cambio (mantiene el árbol montado con
        isPending=true) — el feedback de esos cambios es el overlay de
        ProductsExplorer, no este skeleton.
      */}
      <Suspense fallback={<ProductsExplorerSkeleton />}>
        <ProductsData searchParams={searchParams} />
      </Suspense>
    </PageContainer>
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
  );
}
