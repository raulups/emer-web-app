import type { Brand } from "@/lib/types";
import { FadeInImage } from "@/components/ui/FadeInImage";

interface BrandHeaderProps {
  brand: Brand;
  productCount: number;
}

/**
 * Hero de marca a sangre completa de viewport (~60vh) con el nombre
 * superpuesto en --fg-inverse.
 *
 * El overlay oscuro + blur NO es decorativo: es obligatorio para que el
 * texto tenga contraste AA sobre cualquier imagen de marca, que es
 * precisamente la crítica de accesibilidad más repetida a Zara.com real.
 * Por eso el gradiente sube hasta 0.55 de opacidad en la zona del texto en
 * vez de quedarse en un velo suave.
 */
export function BrandHeader({ brand, productCount }: BrandHeaderProps) {
  const accent = brand.color ?? "var(--fg-inverse)";
  const image = brand.img ?? brand.logo;

  return (
    <header className="bleed-full relative h-[60vh] min-h-[380px] overflow-hidden bg-ink">
      {image ? (
        <FadeInImage
          src={image}
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
      ) : null}

      {/* Capa de legibilidad: gradiente + blur ligero solo en la mitad baja. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/10 backdrop-blur-[2px]"
      />

      <div className="relative flex h-full items-end">
        <div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-8 sm:pb-14">
          <span
            aria-hidden
            className="mb-5 block h-[2px] w-12"
            style={{ backgroundColor: accent }}
          />
          <h1 className="wordmark text-5xl leading-none text-fg-inverse sm:text-7xl">
            {brand.name}
          </h1>
          <p className="mt-4 text-ui uppercase tracking-ui text-fg-inverse">
            {productCount} {productCount === 1 ? "producto" : "productos"}
          </p>
          {brand.url ? (
            <a
              href={brand.url}
              target="_blank"
              rel="noreferrer noopener"
              className="link-underline mt-4 inline-block text-ui uppercase tracking-ui text-fg-inverse"
            >
              Sitio de la marca
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}
