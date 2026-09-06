"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { padCount } from "@/lib/utils/format";
import { FadeInImage } from "@/components/ui/FadeInImage";
import { useGenderQueryString } from "@/hooks/useGenderQueryString";

interface BrandHeroProps {
  /** Foto de campaña. Sin ella se pinta el rayado oscuro del handoff. */
  image: string | null;
  brandCount: number;
}

const HERO_TITLE = "Vestir la calle";

/**
 * Hero inmersivo (1.2 del handoff): 100vh sobre negro, foto b/n a sangre
 * con parallax (`translateY = scrollY × 0.28`), degradado encima y contenido
 * centrado con el botón invertido.
 *
 * La capa de imagen va con `inset: -12% 0` para que el parallax tenga
 * recorrido sin descubrir el fondo. Con `prefers-reduced-motion` el
 * desplazamiento se anula.
 */
export function BrandHero({ image, brandCount }: BrandHeroProps) {
  const genderQuery = useGenderQueryString();
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const shift = useTransform(scrollY, (value) => (reduceMotion ? 0 : value * 0.28));

  return (
    <section className="relative h-screen min-h-[560px] overflow-hidden bg-ink">
      <motion.div style={{ y: shift }} className="absolute inset-x-0 -inset-y-[12%]">
        {image ? (
          <FadeInImage
            src={image}
            alt=""
            aria-hidden
            fill
            sizes="100vw"
            priority
            showPlaceholder={false}
            className="object-cover grayscale"
          />
        ) : (
          <div className="placeholder-dark absolute inset-0" aria-hidden />
        )}
      </motion.div>
      <div aria-hidden className="absolute inset-0 bg-overlay-hero" />

      <div className="relative flex h-full flex-col items-center justify-center px-[clamp(16px,5vw,32px)] text-center">
        <p className="mono mb-6 max-w-[30ch] tracking-mono-widest text-paper/80">
          Marketplace de marcas emergentes
        </p>
        <h2 className="display text-fluid-hero tracking-display text-fg-inverse">{HERO_TITLE}</h2>
        <span aria-hidden className="my-[clamp(22px,4vw,34px)] block h-px w-16 bg-paper/40" />
        <p className="max-w-[44ch] text-fluid-body leading-[1.65] text-paper/85">
          Cada marca vende en su propia web. Nosotros hacemos la selección editorial.
        </p>
        <Link
          href={`/products${genderQuery}`}
          className="mono mt-[clamp(28px,5vw,40px)] inline-flex min-h-cta items-center gap-3.5 bg-paper px-6 py-4 text-ink transition-colors duration-fast ease-zara hover:bg-ink hover:text-fg-inverse focus-visible:outline-paper"
        >
          Ver catálogo <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="mono absolute inset-x-page bottom-[18px] flex justify-between text-paper/70">
        <span>Scroll</span>
        <span>{padCount(brandCount)} marcas</span>
      </div>
    </section>
  );
}
