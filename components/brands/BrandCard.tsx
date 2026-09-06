"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Brand } from "@/lib/types";
import { DUR, EASE, ENTER_Y, staggerDelay } from "@/lib/motion";
import { FadeInImage } from "@/components/ui/FadeInImage";
import { useGenderQueryString } from "@/hooks/useGenderQueryString";

interface BrandCardProps {
  brand: Brand;
  index?: number;
}

/**
 * Card de marca: imagen a sangre del contenedor (sin padding interno) y el
 * nombre debajo, fuera de la imagen. El color de marca se usa como una
 * línea de acento fina al pie de la imagen, no como relleno.
 */
export function BrandCard({ brand, index = 0 }: BrandCardProps) {
  const [hovered, setHovered] = useState(false);
  const genderQuery = useGenderQueryString();
  const accent = brand.color ?? "var(--fg)";
  const image = brand.img ?? brand.logo;

  return (
    <motion.div
      initial={{ opacity: 0, y: ENTER_Y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: DUR.base,
        delay: staggerDelay(index, 0.04),
        ease: EASE,
      }}
    >
      <Link
        href={`/brands/${brand.id}${genderQuery}`}
        className="group block"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-subtle">
          <div
            className={`absolute inset-0 transition-transform duration-slow ease-zara ${
              hovered ? "scale-[1.02]" : "scale-100"
            }`}
          >
            {image ? (
              <FadeInImage
                src={image}
                alt={brand.name}
                fill
                sizes="(min-width: 1024px) 33vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="wordmark text-4xl text-ink">
                  {brand.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <span
            aria-hidden
            className="absolute bottom-0 left-0 h-[2px] w-full"
            style={{ backgroundColor: accent }}
          />
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-3">
          <h2 className="text-ui uppercase tracking-ui text-ink">{brand.name}</h2>
          {brand.is_emergent ? (
            <span className="shrink-0 text-ui uppercase tracking-ui text-muted-text">
              Emergente
            </span>
          ) : null}
        </div>
      </Link>
    </motion.div>
  );
}
