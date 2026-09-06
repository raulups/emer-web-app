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
import { domainOf } from "@/lib/utils/format";
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

/**
 * Detalle de producto con la anatomía del modal del handoff (overlay B),
 * pero como página con ruta propia: dos columnas —galería a la izquierda
 * con borde, ficha a la derecha— y el CTA "Comprar en la web oficial" como
 * único bloque negro. No hay cesta: la compra siempre sale a la marca.
 */
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
  const brandDomain = domainOf(product.product_url);

  return (
    <div>
      <Suspense fallback={<div className="min-h-[52px] border-b border-line" />}>
        <ProductBreadcrumb brand={product.brand} />
      </Suspense>

      <div className="grid border-b border-line lg:grid-cols-2">
        <ProductGallery images={gallery} productName={product.name} />

        <div className="flex flex-col gap-[clamp(16px,3vw,22px)] px-[clamp(18px,4vw,36px)] pb-[clamp(24px,4vw,36px)] pt-[clamp(30px,5vw,44px)]">
          <div className="flex flex-col gap-3">
            <div className="mono flex flex-wrap items-center gap-x-2 gap-y-1 tracking-mono-wide text-text-3">
              {product.brand ? (
                <Suspense fallback={<span>{product.brand.name}</span>}>
                  <ProductBrandLink brandId={product.brand.id} brandName={product.brand.name} />
                </Suspense>
              ) : null}
              {product.brand && product.category ? <span aria-hidden>·</span> : null}
              {product.category ? <span>{product.category.name}</span> : null}
            </div>

            <h1 className="display text-fluid-title tracking-heading">{product.name}</h1>

            <div className="flex flex-wrap items-center gap-3">
              <PriceTag
                currentPrice={product.current_price}
                originalPrice={product.original_price}
                currency={product.currency}
                isOnSale={product.is_on_sale}
                size="lg"
              />
              {product.is_on_sale ? <Badge tone="sale">Rebaja</Badge> : null}
              {product.available === false ? (
                <Badge tone="unavailable">Agotado</Badge>
              ) : null}
            </div>
          </div>

          <hr className="border-0 border-t border-line" />

          {product.description ? (
            <p className="whitespace-pre-line text-fluid-body text-text-2">
              {product.description}
            </p>
          ) : null}

          {product.color_name ? (
            <p className="mono text-text-3">
              Color <span className="text-ink">{product.color_name}</span>
            </p>
          ) : null}

          <SizeGrid sizes={sizes} />

          {product.product_url ? (
            <a
              href={product.product_url}
              target="_blank"
              rel="noreferrer noopener"
              className="mono flex min-h-cta-lg items-center justify-center gap-3.5 bg-ink p-[clamp(20px,4vw,24px)] text-center tracking-mono-wide text-fg-inverse transition-colors duration-fast ease-zara hover:bg-fg-hover"
            >
              Comprar en la web oficial <span aria-hidden>↗</span>
            </a>
          ) : null}

          <div className="mono flex flex-col gap-2.5 text-text-3">
            <span className="flex items-center gap-2">
              <span
                aria-hidden
                className={`h-[5px] w-[5px] ${product.available === false ? "bg-line" : "bg-ink"}`}
              />
              {product.available === false ? "No disponible" : "Disponible"}
            </span>
            {product.brand ? (
              <span>
                Venta y envío gestionados por {product.brand.name}
                {brandDomain ? ` · ${brandDomain}` : ""}
              </span>
            ) : null}
          </div>

          {attributeEntries.length > 0 ? (
            <div className="flex flex-col gap-3">
              <p className="mono tracking-mono-wide text-text-3">Detalles</p>
              <ProductAttributes entries={attributeEntries} />
            </div>
          ) : null}

          {priceHistory.length > 1 ? <PriceHistoryChart history={priceHistory} /> : null}
        </div>
      </div>
    </div>
  );
}
