"use client";

import { useState, type MouseEvent } from "react";
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
 * Card de producto: imagen 3/4 sobre --muted-bg, en b/n que pasa a color y
 * hace zoom 1.04 al hover, con una barra de dos acciones subiendo desde
 * abajo — "Ver pieza" (el destino de la propia card, en papel con borde) y
 * "Comprar ahora" (bloque negro, abre `product_url` en pestaña nueva). Pie
 * con línea mono (marca), nombre en Archivo 700 y precio mono. Bordes
 * derecho e inferior de 1px: la rejilla continua se forma con ellos.
 *
 * "Comprar ahora" es un <button> anidado en el <Link> de la card (un <a>
 * dentro de otro sería HTML inválido), por eso frena el evento con
 * preventDefault/stopPropagation. En dispositivos sin puntero la barra se
 * ve siempre: no hay hover que la descubra.
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

  function openStore(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (!product.product_url) return;
    window.open(product.product_url, "_blank", "noopener,noreferrer");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: ENTER_Y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: DUR.base,
        delay: staggerDelay(index),
        ease: EASE,
      }}
      className="border-b border-r border-line"
    >
      <Link
        href={`/products/${product.id}${genderQuery}`}
        className="group flex h-full flex-col bg-paper"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-subtle">
          <div className="photo-reveal absolute inset-0 transition-transform duration-zoom ease-zara group-hover:scale-[1.04]">
            {product.main_image_url ? (
              <FadeInImage
                src={product.main_image_url}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover"
                visible={!(hovered && secondImage)}
              />
            ) : (
              <div className="placeholder-light absolute inset-0 flex items-center justify-center p-5 text-center">
                <span className="mono text-text-3">Sin foto</span>
              </div>
            )}
            {secondImage ? (
              <FadeInImage
                src={secondImage}
                alt=""
                aria-hidden
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="absolute inset-0 object-cover"
                visible={hovered}
                showPlaceholder={false}
              />
            ) : null}
          </div>

          <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
            {product.is_on_sale ? <Badge tone="sale">Rebaja</Badge> : null}
            {product.available === false ? (
              <Badge tone="unavailable">Agotado</Badge>
            ) : null}
          </div>

          {/* Barra de acciones: sube al hover o al enfocar el botón por teclado. */}
          <div className="absolute inset-x-0 bottom-0 grid translate-y-full grid-cols-[1fr_auto] border-t border-ink transition-transform duration-base ease-zara group-hover:translate-y-0 group-focus-within:translate-y-0 touch:translate-y-0">
            <span className="mono flex min-h-hit items-center justify-center bg-paper px-3 text-ink">
              Ver pieza <span aria-hidden>&nbsp;→</span>
            </span>
            {product.product_url ? (
              <button
                type="button"
                onClick={openStore}
                aria-label={`Comprar ahora en la web oficial: ${product.name}`}
                className="mono flex min-h-hit items-center justify-center gap-2 border-l border-ink bg-ink px-3 text-fg-inverse transition-colors duration-fast ease-zara hover:bg-fg-hover"
              >
                Comprar ahora <span aria-hidden>↗</span>
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4 pb-5">
          {showBrand && product.brand ? (
            <p className="mono text-text-3">{product.brand.name}</p>
          ) : null}
          <div className="flex items-baseline justify-between gap-2.5">
            <h3 className="text-fluid-name font-bold uppercase tracking-name text-ink">
              {product.name}
            </h3>
            <div className="shrink-0">
              <PriceTag
                currentPrice={product.current_price}
                originalPrice={product.original_price}
                currency={product.currency}
                isOnSale={product.is_on_sale}
              />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
