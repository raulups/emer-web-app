"use client";

import Link from "next/link";
import type { ProductListItem } from "@/lib/types";
import { padCount } from "@/lib/utils/format";
import { FadeInImage } from "@/components/ui/FadeInImage";
import { useGenderQueryString } from "@/hooks/useGenderQueryString";

interface CatalogHeroProps {
  /** Hasta cuatro productos de marcas DISTINTAS, con foto. */
  products: ProductListItem[];
  totalProducts: number;
}

const HERO_TITLE = "Vestir la calle";

/**
 * Entrada al catálogo global. Sustituye al hero con foto de campaña: no hay
 * una foto de campaña propia, y usar la de una marca concreta como fondo de
 * una sección global la atribuía a esa marca. Ahora: bloque negro con el
 * titular tipográfico y, debajo, un mosaico de cuatro productos reales de
 * cuatro marcas distintas, cada uno enlazado a su ficha.
 *
 * En móvil solo queda lo funcional: titular, botón y mosaico en 2×2. Las
 * líneas editoriales (eyebrow, regla, párrafo) son de desktop.
 */
export function CatalogHero({ products, totalProducts }: CatalogHeroProps) {
  const genderQuery = useGenderQueryString();

  return (
    <section className="border-b border-line bg-ink text-fg-inverse">
      <div className="flex flex-col items-center px-page pb-8 pt-[clamp(34px,7vw,76px)] text-center md:pb-12">
        <p className="mono mb-6 hidden max-w-[30ch] tracking-mono-widest text-paper/80 md:block">
          Catálogo global · {padCount(totalProducts)} referencias
        </p>
        <h2 className="display text-fluid-hero tracking-display">{HERO_TITLE}</h2>
        <span aria-hidden className="my-[clamp(22px,4vw,34px)] hidden h-px w-16 bg-paper/40 md:block" />
        <p className="hidden max-w-[44ch] text-fluid-body leading-[1.65] text-paper/85 md:block">
          Cada marca vende en su propia web. Nosotros hacemos la selección editorial.
        </p>
        <Link
          href={`/products${genderQuery}`}
          className="mono mt-6 inline-flex min-h-cta items-center gap-3.5 bg-paper px-6 py-4 text-ink transition-colors duration-fast ease-zara hover:bg-paper/85 focus-visible:outline-paper md:mt-[clamp(28px,5vw,40px)]"
        >
          Ver catálogo <span aria-hidden>→</span>
        </Link>
      </div>

      {products.length > 0 ? (
        <ul
          className="grid grid-cols-2 gap-px border-t border-paper/20 bg-paper/20 md:grid-cols-4"
          aria-label="Piezas destacadas"
        >
          {products.map((product) => (
            <li key={product.id} className="bg-ink">
              <Link
                href={`/products/${product.id}${genderQuery}`}
                className="group relative block aspect-[3/4] overflow-hidden bg-ink"
              >
                <div className="photo-zoom absolute inset-0 group-hover:scale-[1.04]">
                  {product.main_image_url ? (
                    <FadeInImage
                      src={product.main_image_url}
                      alt={product.name}
                      fill
                      sizes="(min-width: 768px) 25vw, 50vw"
                      className="object-cover"
                      showPlaceholder={false}
                    />
                  ) : null}
                </div>
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-ink/0" />
                <span className="mono absolute inset-x-3 bottom-3 truncate text-paper/90 md:inset-x-4 md:bottom-4">
                  {product.brand ? `${product.brand.name} · ` : ""}
                  {product.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
