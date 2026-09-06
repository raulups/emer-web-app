import type { Metadata } from "next";
import { Suspense, cache } from "react";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  DEFAULT_PAGE_SIZE,
  buildCategoryTree,
  getBrandById,
  getBrandProductCount,
  getCategories,
  getCategoryDescendantIds,
  getProductsCount,
  getProductsPage,
} from "@/lib/supabase/queries";
import { parseProductFilters, type FilterSearchParams } from "@/lib/types/filters";
import { PageContainer } from "@/components/layout/PageContainer";
import { BrandHeader } from "@/components/brands/BrandHeader";
import { BrandHeaderSkeleton } from "@/components/brands/BrandHeaderSkeleton";
import { ProductsExplorer } from "@/components/products/ProductsExplorer";
import { ProductsExplorerSkeleton } from "@/components/products/ProductsExplorerSkeleton";

interface BrandPageProps {
  params: { brandId: string };
  searchParams: FilterSearchParams;
}

// cache() dedupe: generateMetadata y BrandData piden la misma marca dentro
// del mismo request; sin esto se dispararían dos SELECT idénticos.
const getCachedBrand = cache((brandId: string) =>
  getBrandById(createServerSupabaseClient(), brandId),
);

export async function generateMetadata({
  params,
}: BrandPageProps): Promise<Metadata> {
  const brand = await getCachedBrand(params.brandId);
  return { title: brand?.name ?? "Marca" };
}

export default function BrandPage({ params, searchParams }: BrandPageProps) {
  return (
    <div>
      {/* El hero va fuera de PageContainer: así puede ir a sangre completa. */}
      <Suspense fallback={<BrandHeaderSkeleton />}>
        <BrandHeaderData brandId={params.brandId} />
      </Suspense>
      <PageContainer>
        <Suspense fallback={<ProductsExplorerSkeleton />}>
          <BrandProductsData params={params} searchParams={searchParams} />
        </Suspense>
      </PageContainer>
    </div>
  );
}

async function BrandHeaderData({ brandId }: { brandId: string }) {
  const brand = await getCachedBrand(brandId);
  if (!brand) notFound();

  const productCount = await getBrandProductCount(
    createServerSupabaseClient(),
    brand.id,
  );

  return <BrandHeader brand={brand} productCount={productCount} />;
}

async function BrandProductsData({ params, searchParams }: BrandPageProps) {
  const client = createServerSupabaseClient();

  const [brand, categories] = await Promise.all([
    getCachedBrand(params.brandId),
    getCategories(client),
  ]);
  if (!brand) notFound();

  const filters = parseProductFilters(searchParams, { brandId: brand.id });
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
      lockedBrandId={brand.id}
      initialItems={items}
      initialHasMore={hasMore}
      totalCount={totalCount}
      categoryIds={categoryIds}
    />
  );
}
