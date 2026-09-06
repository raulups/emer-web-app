"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Brand } from "@/lib/types";
import { DUR, EASE, ENTER_Y, staggerDelay } from "@/lib/motion";
import { domainOf, padCount } from "@/lib/utils/format";
import { FadeInImage } from "@/components/ui/FadeInImage";
import { useGenderQueryString } from "@/hooks/useGenderQueryString";

type BrandCardVariant = "full" | "wide" | "narrow";

interface BrandCardProps {
  brand: Brand;
  index?: number;
  /** Posición en el bento: fila completa, columna ancha (68) o estrecha (32). */
  variant?: BrandCardVariant;
}

const VARIANT_CLASSES: Record<
  BrandCardVariant,
  { box: string; name: string; button: string }
> = {
  full: {
    box: "h-[56vh] min-h-[340px] border-b border-line md:h-[74vh]",
    name: "text-fluid-bento-full tracking-display-xl",
    button: "left-page",
  },
  wide: {
    box: "h-[64vh] min-h-[380px] border-b border-line md:h-[86vh] md:border-b-0 md:border-r",
    name: "text-fluid-bento-wide tracking-display-xl",
    button: "left-page",
  },
  narrow: {
    box: "h-[56vh] min-h-[340px] md:h-[86vh]",
    name: "text-fluid-bento-narrow tracking-display",
    // En la columna estrecha el botón ocupa todo el ancho y se centra.
    button: "left-page right-page justify-center",
  },
};

/**
 * Tarjeta de marca del bento: foto a sangre en b/n que pasa a color y hace
 * zoom 1.05 al hover, nombre gigante centrado que se atenúa, etiqueta mono
 * arriba-izquierda y botón negro "Ver colección" que sube desde 14px.
 *
 * Toda la tarjeta es el enlace. En dispositivos sin puntero el botón se ve
 * siempre (`touch:`): no hay hover que lo descubra.
 */
export function BrandCard({ brand, index = 0, variant = "full" }: BrandCardProps) {
  const genderQuery = useGenderQueryString();
  const image = brand.img ?? brand.logo;
  const classes = VARIANT_CLASSES[variant];
  const meta = [padCount(index + 1), brand.is_emergent ? "Emergente" : domainOf(brand.url)]
    .filter(Boolean)
    .join(" — ");

  return (
    <motion.div
      initial={{ opacity: 0, y: ENTER_Y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.base, delay: staggerDelay(index, 0.06), ease: EASE }}
    >
      <Link
        href={`/brands/${brand.id}${genderQuery}`}
        className={`group relative block overflow-hidden bg-subtle ${classes.box}`}
        aria-label={`${brand.name}: ver colección`}
      >
        <div className="photo-reveal absolute inset-0 transition-transform duration-zoom ease-zara group-hover:scale-[1.05]">
          {image ? (
            <FadeInImage
              src={image}
              alt=""
              aria-hidden
              fill
              sizes={variant === "narrow" ? "(min-width: 768px) 32vw, 100vw" : "100vw"}
              className="object-cover"
              showPlaceholder={false}
            />
          ) : (
            <div className="placeholder-dark absolute inset-0" aria-hidden />
          )}
        </div>
        <div aria-hidden className="absolute inset-0 bg-overlay-card" />

        <div className="absolute inset-0 flex items-center justify-center px-4">
          <span
            className={`display text-center text-fg-inverse opacity-70 transition-opacity duration-slow ease-zara group-hover:opacity-30 ${classes.name}`}
          >
            {brand.name}
          </span>
        </div>

        <span className="mono absolute left-page right-4 top-5 text-paper/85">{meta}</span>

        <span
          className={`mono absolute bottom-[22px] inline-flex min-h-cta translate-y-[14px] items-center gap-3.5 bg-ink px-[22px] py-4 text-fg-inverse opacity-0 transition-[opacity,transform] duration-base ease-zara group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 touch:translate-y-0 touch:opacity-100 ${classes.button}`}
        >
          Ver colección <span aria-hidden>→</span>
        </span>
      </Link>
    </motion.div>
  );
}
