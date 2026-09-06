import { Suspense } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getBrands, getProductsCount, getProductsPage } from "@/lib/supabase/queries";
import type { ProductListItem } from "@/lib/types";
import { HomeIntro } from "@/components/brands/HomeIntro";
import { CatalogHero } from "@/components/brands/CatalogHero";
import { Directory } from "@/components/brands/Directory";
import { BrandGrid } from "@/components/brands/BrandGrid";
import { CatalogCta } from "@/components/brands/CatalogCta";
import { Marquee } from "@/components/ui/Marquee";
import { BrandGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

/**
 * Home, en este orden de secciones: índice de marcas + logo → entrada al
 * catálogo (titular + mosaico de producto) → marquee → el directorio (solo
 * desktop) → bento de marcas → CTA al catálogo.
 */
export default function BrandsPage() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeData />
    </Suspense>
  );
}

/**
 * Un producto reciente con foto de cada una de las primeras marcas, hasta
 * llenar cuatro. Se consulta POR MARCA a propósito: los N productos más
 * recientes del catálogo suelen venir del mismo lote de scraping (una sola
 * tienda), y filtrar "los últimos 32" dejaba el mosaico con una única marca
 * — justo lo que este hero no puede parecer.
 */
async function getFeatured(
  client: ReturnType<typeof createServerSupabaseClient>,
  brands: { id: string }[],
  count = 4,
): Promise<ProductListItem[]> {
  const candidates = brands.slice(0, count + 2);
  const pages = await Promise.all(
    candidates.map((brand) =>
      getProductsPage(client, { sort: "newest", brandId: brand.id }, undefined, {
        page: 0,
        pageSize: 4,
      }),
    ),
  );
  return pages
    .map((page) => page.items.find((item) => item.main_image_url) ?? null)
    .filter((item): item is ProductListItem => item !== null)
    .slice(0, count);
}

async function HomeData() {
  const client = createServerSupabaseClient();
  const [brands, totalProducts] = await Promise.all([
    getBrands(client),
    getProductsCount(client, { sort: "newest" }),
  ]);
  const featured = await getFeatured(client, brands);

  return (
    <div>
      <HomeIntro brands={brands} totalProducts={totalProducts} />
      <CatalogHero products={featured} totalProducts={totalProducts} />
      <Marquee />
      <Directory brandCount={brands.length} totalProducts={totalProducts} />
      <BrandGrid brands={brands} />
      <CatalogCta totalProducts={totalProducts} />
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div>
      <div className="flex flex-col border-b border-line md:min-h-[calc(100vh-var(--header-h))]">
        <div className="grid gap-[clamp(18px,4vw,40px)] px-page pb-[clamp(22px,4vw,34px)] pt-section lg:grid-cols-[minmax(0,52fr)_minmax(0,48fr)]">
          <div className="space-y-5">
            <Skeleton className="hidden h-4 w-64 md:block" />
            <Skeleton className="h-[clamp(88px,26vw,292px)] w-3/4" />
          </div>
          <div className="hidden space-y-4 lg:block">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <div className="flex flex-1 items-center gap-2 px-page py-4">
          <Skeleton className="h-[clamp(260px,46vh,440px)] w-[clamp(300px,64vw,720px)] shrink-0" />
          <Skeleton className="h-[clamp(260px,46vh,440px)] w-[clamp(300px,64vw,720px)] shrink-0" />
        </div>
      </div>
      <div className="bg-ink px-page pb-8 pt-[clamp(34px,7vw,76px)] md:pb-12">
        <Skeleton className="mx-auto h-[clamp(44px,12vw,184px)] w-2/3 bg-paper/10" />
      </div>
      <BrandGridSkeleton />
    </div>
  );
}
