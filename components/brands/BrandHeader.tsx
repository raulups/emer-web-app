import Link from "next/link";
import type { Brand } from "@/lib/types";
import { domainOf, padCount } from "@/lib/utils/format";
import { FadeInImage } from "@/components/ui/FadeInImage";

interface BrandHeaderProps {
  brand: Brand;
  productCount: number;
  /** Posición de la marca en el índice ("01 / 12"), para la barra de volver. */
  position?: { index: number; total: number };
}

/**
 * Cabecera de la tienda de marca (Vista 2 del handoff): barra de volver y
 * banner con la foto a sangre, nombre gigante abajo-izquierda y, a la
 * derecha, descripción y fila mono con la meta de la marca.
 *
 * El degradado (35% → 75% de negro) no es decorativo: garantiza contraste
 * AA del texto blanco sobre cualquier fotografía.
 */
export function BrandHeader({ brand, productCount, position }: BrandHeaderProps) {
  const image = brand.img ?? brand.logo;
  const domain = domainOf(brand.url);

  return (
    <header>
      <div className="mono flex items-center justify-between gap-4 border-b border-line px-page py-3.5">
        <Link href="/" className="link-quiet flex min-h-hit items-center gap-2.5 text-ink">
          <span aria-hidden>←</span> Volver al directorio
        </Link>
        {position ? (
          <span className="whitespace-nowrap text-text-3">
            {padCount(position.index + 1)} / {padCount(position.total)}
          </span>
        ) : null}
      </div>

      <section className="relative overflow-hidden border-b border-line bg-subtle">
        {image ? (
          <FadeInImage
            src={image}
            alt=""
            aria-hidden
            fill
            sizes="100vw"
            priority
            showPlaceholder={false}
            className="object-cover"
          />
        ) : (
          <div className="placeholder-dark absolute inset-0" aria-hidden />
        )}

        <div className="relative grid items-end gap-[clamp(22px,4vw,40px)] bg-overlay-banner px-page pb-[clamp(28px,5vw,40px)] pt-[clamp(52px,9vw,88px)] lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <h1 className="display text-fluid-brand tracking-display-xl text-fg-inverse">
            {brand.name}
          </h1>
          <div className="flex flex-col gap-4 pb-1.5">
            <p className="max-w-[44ch] text-fluid-body leading-[1.65] text-paper/90">
              {brand.is_emergent
                ? "Marca emergente. Mantiene su propia dirección de arte y gestiona sus ventas en su web oficial."
                : "Mantiene su propia dirección de arte y gestiona sus ventas en su web oficial."}
            </p>
            <div className="mono flex flex-wrap gap-[clamp(14px,3.5vw,26px)] border-t border-paper/30 pt-3 text-paper/80">
              <span>
                {padCount(productCount)} {productCount === 1 ? "producto" : "productos"}
              </span>
              {brand.is_emergent ? <span>Emergente</span> : null}
              {brand.url && domain ? (
                <a
                  href={brand.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link-quiet text-fg-inverse focus-visible:outline-paper"
                >
                  {domain} <span aria-hidden>↗</span>
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </header>
  );
}
