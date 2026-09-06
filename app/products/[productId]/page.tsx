import type { Metadata } from "next";
import { Suspense, cache } from "react";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getProductById, getProductPriceHistory } from "@/lib/supabase/queries";
import {
  attributesToEntries,
  imageUrlsToList,
  sizesToOptions,
} from "@/lib/types";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/Badge";
import { PriceTag } from "@/components/ui/PriceTag";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductAttributes } from "@/components/products/ProductAttributes";
import { ProductBreadcrumb } from "@/components/products/ProductBreadcrumb";
import { ProductBrandLink } from "@/components/products/ProductBrandLink";
import { SizeGrid } from "@/components/products/SizeGrid";
import { PriceHistoryChart } from "@/components/products/PriceHistoryChart";

interface ProductPageProps {
  params: { productId: string };
}

// cache() dedupe: generateMetadata y la página piden el mismo producto
// dentro del mismo request.
const getCachedProduct = cache((productId: string) =>
  getProductById(createServerSupabaseClient(), productId),
);

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const product = await getCachedProduct(params.productId);
  return { title: product?.name ?? "Producto" };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getCachedProduct(params.productId);

  if (!product) notFound();

  const priceHistory = await getProductPriceHistory(
    createServerSupabaseClient(),
    product.id,
  );

  const images = imageUrlsToList(product.image_urls);
  const gallery = images.length > 0
    ? images
    : product.main_image_url
      ? [product.main_image_url]
      : [];

  const sizes = sizesToOptions(product.sizes);
  const attributeEntries = attributesToEntries(product.attributes);

  return (
    <PageContainer>
      <Suspense fallback={null}>
        <ProductBreadcrumb brand={product.brand} />
      </Suspense>

      {/* La galería se lleva el 65% del ancho en desktop: el peso visual va
          en la fotografía, y la columna de info queda pegada al lado. */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[65fr_35fr] lg:gap-16">
        <ProductGallery images={gallery} productName={product.name} />

        <div className="divide-y divide-line lg:sticky lg:top-header lg:self-start">
          <div className="pb-8">
            <div className="flex flex-wrap gap-1.5">
              {product.is_on_sale ? <Badge tone="sale">Rebaja</Badge> : null}
              {product.available === false ? (
                <Badge tone="unavailable">Agotado</Badge>
              ) : null}
            </div>

            {product.brand ? (
              <Suspense fallback={null}>
                <ProductBrandLink brandId={product.brand.id} brandName={product.brand.name} />
              </Suspense>
            ) : null}

            {/* Peso ligero (300): el sistema lo reserva a nombres de producto. */}
            <h1 className="mt-3 text-3xl font-light uppercase leading-tight tracking-ui text-ink sm:text-4xl">
              {product.name}
            </h1>

            {product.category ? (
              <p className="mt-3 text-ui uppercase tracking-ui text-muted-text">
                {product.category.name}
              </p>
            ) : null}

            <div className="mt-6">
              <PriceTag
                currentPrice={product.current_price}
                originalPrice={product.original_price}
                currency={product.currency}
                isOnSale={product.is_on_sale}
                size="lg"
              />
            </div>
          </div>

          {product.description ? (
            <div className="py-8">
              {/* Interlineado amplio en bloques descriptivos. */}
              <p className="whitespace-pre-line text-ui leading-relaxed text-ink">
                {product.description}
              </p>
            </div>
          ) : null}

          {product.color_name || sizes.length > 0 ? (
            <div className="space-y-6 py-8">
              {product.color_name ? (
                <p className="text-ui text-ink">
                  <span className="text-muted-text">Color: </span>
                  {product.color_name}
                </p>
              ) : null}
              <SizeGrid sizes={sizes} />
            </div>
          ) : null}

          <div className="py-8">
            <div className="flex items-center gap-2 text-ui">
              <span
                aria-hidden
                className={`h-2 w-2 ${product.available === false ? "bg-line" : "bg-ink"}`}
              />
              <span className="text-ink">
                {product.available === false ? "No disponible" : "Disponible"}
              </span>
            </div>

            {product.product_url ? (
              <a
                href={product.product_url}
                target="_blank"
                rel="noreferrer noopener"
                className="link-underline mt-4 inline-block text-ui uppercase tracking-ui text-ink"
              >
                Ver en la tienda
              </a>
            ) : null}
          </div>

          {attributeEntries.length > 0 ? (
            <div className="py-8">
              <p className="mb-3 text-ui uppercase tracking-ui text-ink">
                Detalles
              </p>
              <ProductAttributes entries={attributeEntries} />
            </div>
          ) : null}

          {priceHistory.length > 1 ? (
            <div className="py-8">
              <PriceHistoryChart history={priceHistory} />
            </div>
          ) : null}
        </div>
      </div>
    </PageContainer>
  );
}
