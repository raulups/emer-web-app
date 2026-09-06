"use client";

import { Portal } from "@/components/ui/Portal";

interface VisitBrandButtonProps {
  url: string;
  brandName: string;
}

/**
 * CTA fijo a la web oficial de la marca, visible durante todo el scroll de
 * `/brands/[brandId]`. No existe en `/products`: ahí conviven marcas
 * distintas y no hay una única web a la que enviar.
 *
 * Va en un Portal a `document.body` por la misma razón que el modal: el
 * contenido de página vive dentro del `motion.div` de PageTransition, y
 * mientras dura su animación de entrada ese `transform` convertiría a este
 * elemento `fixed` en relativo a la página, haciéndolo saltar.
 *
 * En móvil ocupa el ancho completo abajo (a 320px el texto no cabe en una
 * pastilla); desde `sm` se recoge a una pastilla abajo a la derecha.
 */
export function VisitBrandButton({ url, brandName }: VisitBrandButtonProps) {
  return (
    <Portal>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visitar la página oficial de ${brandName}`}
        className="mono fixed inset-x-0 bottom-0 z-40 flex min-h-cta items-center justify-center gap-3 border-t border-ink bg-ink px-4 text-fg-inverse transition-colors duration-fast ease-zara hover:bg-fg-hover sm:inset-x-auto sm:bottom-6 sm:right-page sm:border sm:px-6"
      >
        Visitar página oficial <span aria-hidden>↗</span>
      </a>
    </Portal>
  );
}
