"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { ProductListItem } from "@/lib/types";
import { imageUrlsToList } from "@/lib/types";
import { DUR, EASE, ENTER_Y, staggerDelay } from "@/lib/motion";
import { Badge } from "@/components/ui/Badge";
import { PriceTag } from "@/components/ui/PriceTag";
import { FadeInImage } from "@/components/ui/FadeInImage";
import { useGenderQueryString } from "@/hooks/useGenderQueryString";

interface ProductCardProps {
  product: ProductListItem;
  index?: number;
  showBrand?: boolean;
}

/**
 * Card de producto: imagen a sangre (100% del contenedor, sin padding
 * interno) y el texto siempre DEBAJO, fuera de la imagen. Lo único que se
 * superpone es el chip de rebaja y el botón de compra directa.
 */
export function ProductCard({
  product,
  index = 0,
  showBrand = false,
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const genderQuery = useGenderQueryString();

  const gallery = imageUrlsToList(product.image_urls);
  const secondImage =
    gallery.find((url) => url && url !== product.main_image_url) ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: ENTER_Y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: DUR.base,
        delay: staggerDelay(index),
        ease: EASE,
      }}
    >
      <Link
        href={`/products/${product.id}${genderQuery}`}
        className="group block"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-subtle">
          {/* Zoom máximo del sistema: 1.02. */}
          <div
            className={`absolute inset-0 transition-transform duration-slow ease-zara ${
              hovered ? "scale-[1.02]" : "scale-100"
            }`}
          >
            {product.main_image_url ? (
              <FadeInImage
                src={product.main_image_url}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 33vw, 50vw"
                className="object-cover"
                visible={!(hovered && secondImage)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-ui uppercase tracking-ui text-muted-text">
                Sin imagen
              </div>
            )}
            {secondImage ? (
              <FadeInImage
                src={secondImage}
                alt=""
                aria-hidden
                fill
                sizes="(min-width: 1024px) 33vw, 50vw"
                className="absolute inset-0 object-cover"
                visible={hovered}
                showPlaceholder={false}
              />
            ) : null}
          </div>

          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {product.is_on_sale ? <Badge tone="sale">Rebaja</Badge> : null}
            {product.available === false ? (
              <Badge tone="unavailable">Agotado</Badge>
            ) : null}
          </div>

          {product.product_url ? (
            <div className="absolute bottom-3 right-3 opacity-100 transition-opacity duration-base ease-zara md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
              <button
                type="button"
                aria-label={`Ir a la tienda: ${product.name}`}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  window.open(
                    product.product_url ?? "",
                    "_blank",
                    "noopener,noreferrer",
                  );
                }}
                className="flex h-10 items-center gap-2 border border-ink bg-ink px-3 text-ui uppercase tracking-ui text-fg-inverse transition-colors duration-fast ease-zara hover:bg-paper hover:text-ink"
              >
                <BagIcon />
                <span className="hidden lg:inline">Ir a la tienda</span>
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-4 space-y-1.5">
          {showBrand && product.brand ? (
            <p className="text-ui uppercase tracking-ui text-muted-text">
              {product.brand.name}
            </p>
          ) : null}
          {/* Peso ligero (300) reservado a nombres de producto. */}
          <h3 className="text-ui font-light uppercase tracking-ui text-ink">
            {product.name}
          </h3>
          <PriceTag
            currentPrice={product.current_price}
            originalPrice={product.original_price}
            currency={product.currency}
            isOnSale={product.is_on_sale}
          />
        </div>
      </Link>
    </motion.div>
  );
}

function BagIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path
        d="M3.5 4.5h8l0.5 8.5h-9l0.5-8.5Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 4.5v-1a2 2 0 0 1 4 0v1"
        stroke="currentColor"
        strokeWidth="1.1"
      />
    </svg>
  );
}
