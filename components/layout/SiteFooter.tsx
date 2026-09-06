import Link from "next/link";

/**
 * Pie del handoff: wordmark grande a la izquierda y columnas mono. Sin
 * enlaces externos inventados — solo navegación interna real y las dos
 * líneas de principio del catálogo (venta directa, sin cesta).
 */
export function SiteFooter() {
  return (
    <footer className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-8 border-t border-line bg-paper px-page pb-10 pt-section">
      <div className="display text-[clamp(26px,6vw,30px)] leading-[0.9] tracking-[-0.05em]">
        Catálogo
        <br />
        ES
      </div>
      <div className="mono flex flex-col gap-2.5 text-text-3">
        <span>Venta directa de marca</span>
        <span>Sin cesta compartida</span>
        <span>Selección editorial</span>
      </div>
      <nav aria-label="Pie de página" className="mono flex flex-col gap-2.5 text-text-3">
        <Link href="/" className="link-quiet text-ink">
          Marcas
        </Link>
        <Link href="/products" className="link-quiet text-ink">
          Catálogo
        </Link>
      </nav>
      <div className="mono self-end text-text-3">© {new Date().getFullYear()}</div>
    </footer>
  );
}
