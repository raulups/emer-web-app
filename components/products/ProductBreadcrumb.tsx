"use client";

import Link from "next/link";
import { useGenderQueryString } from "@/hooks/useGenderQueryString";

interface ProductBreadcrumbProps {
  brand: { id: string; name: string } | null;
}

/**
 * Barra de volver del detalle (la del handoff en la tienda de marca): a la
 * izquierda "← Volver" a la marca si la hay, si no al catálogo; a la
 * derecha el nombre de la marca. Preserva el género activo en los links.
 */
export function ProductBreadcrumb({ brand }: ProductBreadcrumbProps) {
  const genderQuery = useGenderQueryString();

  return (
    <nav
      aria-label="Volver"
      className="mono flex items-center justify-between gap-4 border-b border-line px-page py-3.5"
    >
      <Link
        href={brand ? `/brands/${brand.id}${genderQuery}` : `/products${genderQuery}`}
        className="link-quiet flex min-h-hit items-center gap-2.5 text-ink"
      >
        <span aria-hidden>←</span> {brand ? `Volver a ${brand.name}` : "Volver al catálogo"}
      </Link>
      <Link href={`/products${genderQuery}`} className="link-quiet whitespace-nowrap text-text-3">
        Catálogo <span aria-hidden>→</span>
      </Link>
    </nav>
  );
}
