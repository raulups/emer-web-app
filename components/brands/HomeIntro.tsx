import type { Brand } from "@/lib/types";
import { padCount } from "@/lib/utils/format";
import { AdminBrandActions } from "@/components/admin/AdminBrandActions";
import { BrandIndex } from "./BrandIndex";
import { SearchBrandLink } from "./SearchBrandLink";

interface HomeIntroProps {
  brands: Brand[];
  totalProducts: number;
}

/**
 * Primera pantalla de la home (1.1 del handoff): bloque de logo asimétrico
 * (52/48, alineado abajo) con el wordmark en dos líneas —la segunda
 * delineada y desplazada, ese "espacio irregular" es intencional—, la
 * cabecera del índice y el carrusel horizontal de nombres.
 */
export function HomeIntro({ brands, totalProducts }: HomeIntroProps) {
  return (
    <section className="flex min-h-[calc(100vh-var(--header-h))] flex-col border-b border-line">
      <div className="grid items-end gap-[clamp(18px,4vw,40px)] px-page pb-[clamp(22px,4vw,34px)] pt-section lg:grid-cols-[minmax(0,52fr)_minmax(0,48fr)]">
        <div className="flex flex-col gap-[clamp(12px,2vw,20px)]">
          <p className="mono tracking-mono-widest text-text-3">
            Marketplace de marcas emergentes
          </p>
          <h1 className="display text-fluid-logo tracking-display-xl">
            Catálogo
            <br />
            <span className="text-outline ml-[clamp(20px,9vw,128px)] inline-block">/ ES</span>
          </h1>
        </div>
        <div className="flex flex-col gap-4 pb-[clamp(6px,1.5vw,16px)] lg:border-l lg:border-line lg:pl-[clamp(20px,3vw,34px)]">
          <p className="max-w-[40ch] text-fluid-body text-text-2">
            Un índice, {brands.length} {brands.length === 1 ? "marca" : "marcas"}. Descubre
            aquí; compra directamente en la web de cada una.
          </p>
          <div className="mono flex flex-wrap gap-[clamp(14px,3.5vw,26px)] border-t border-line pt-3 text-text-3">
            <span>{padCount(brands.length)} Marcas</span>
            <span>{padCount(totalProducts)} Referencias</span>
            <span>Venta directa</span>
          </div>
        </div>
      </div>

      <div className="mono flex items-baseline justify-between gap-4 px-page pb-bar text-text-3">
        <span>
          Índice de marcas — desliza <span aria-hidden>→</span>
        </span>
        <div className="flex items-center gap-[clamp(14px,3vw,24px)]">
          <SearchBrandLink />
          <AdminBrandActions />
        </div>
      </div>

      <BrandIndex brands={brands} />
    </section>
  );
}
