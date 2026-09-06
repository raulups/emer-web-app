import { Suspense } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getBrands } from "@/lib/supabase/queries";
import { PageContainer } from "@/components/layout/PageContainer";
import { BrandGrid } from "@/components/brands/BrandGrid";
import { BrandGridSkeleton } from "@/components/ui/Skeleton";

export default function BrandsPage() {
  return (
    <PageContainer>
      <div className="mb-12 border-b border-line pb-8">
        <h1 className="font-display text-4xl tracking-display text-ink sm:text-6xl">
          Marcas
        </h1>
      </div>
      <Suspense fallback={<BrandGridSkeleton />}>
        <BrandsData />
      </Suspense>
    </PageContainer>
  );
}

async function BrandsData() {
  const client = createServerSupabaseClient();
  const brands = await getBrands(client);

  return (
    <div>
      <p className="mb-10 text-ui uppercase tracking-ui text-muted-text">
        {brands.length} {brands.length === 1 ? "marca" : "marcas"} en el catálogo
      </p>
      <BrandGrid brands={brands} />
    </div>
  );
}
