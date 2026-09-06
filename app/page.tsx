import { Suspense } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getBrands, getProductsCount } from "@/lib/supabase/queries";
import { HomeIntro } from "@/components/brands/HomeIntro";
import { BrandHero } from "@/components/brands/BrandHero";
import { Directory } from "@/components/brands/Directory";
import { BrandGrid } from "@/components/brands/BrandGrid";
import { CatalogCta } from "@/components/brands/CatalogCta";
import { Marquee } from "@/components/ui/Marquee";
import { BrandGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

/**
 * Home (Vista 1 del handoff), en este orden de secciones:
 * índice de marcas + logo → hero inmersivo → marquee → el directorio →
 * bento de marcas → CTA al catálogo.
 */
export default function BrandsPage() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeData />
    </Suspense>
  );
}

async function HomeData() {
  const client = createServerSupabaseClient();
  const [brands, totalProducts] = await Promise.all([
    getBrands(client),
    getProductsCount(client, { sort: "newest" }),
  ]);

  // Foto de campaña del hero: el handoff pide una foto b/n a sangre. No hay
  // un asset de campaña propio, así que se usa la imagen de la primera marca
  // que tenga una — en escala de grises, como pide el diseño.
  const heroImage = brands.find((brand) => brand.img)?.img ?? null;

  return (
    <div>
      <HomeIntro brands={brands} totalProducts={totalProducts} />
      <BrandHero image={heroImage} brandCount={brands.length} />
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
      <div className="flex min-h-[calc(100vh-var(--header-h))] flex-col border-b border-line">
        <div className="grid gap-[clamp(18px,4vw,40px)] px-page pb-[clamp(22px,4vw,34px)] pt-section lg:grid-cols-[minmax(0,52fr)_minmax(0,48fr)]">
          <div className="space-y-5">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-[clamp(88px,26vw,292px)] w-3/4" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <div className="flex flex-1 items-center gap-10 px-page">
          <Skeleton className="h-[clamp(52px,13vw,128px)] w-[40vw]" />
          <Skeleton className="h-[clamp(52px,13vw,128px)] w-[30vw]" />
        </div>
      </div>
      <Skeleton className="h-[100vh] min-h-[560px] w-full" />
      <BrandGridSkeleton />
    </div>
  );
}
