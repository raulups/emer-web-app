"use client";

import Link from "next/link";
import { padCount } from "@/lib/utils/format";
import { useGenderQueryString } from "@/hooks/useGenderQueryString";

interface CatalogCtaProps {
  totalProducts: number;
}

/** CTA de catálogo (1.6 del handoff): bloque negro clicable a ancho completo. */
export function CatalogCta({ totalProducts }: CatalogCtaProps) {
  const genderQuery = useGenderQueryString();

  return (
    <Link
      href={`/products${genderQuery}`}
      className="grid items-center gap-[clamp(20px,4vw,28px)] bg-ink px-page py-[clamp(44px,8vw,72px)] text-fg-inverse transition-colors duration-fast ease-zara hover:bg-fg-hover focus-visible:outline-paper lg:grid-cols-[minmax(0,1fr)_auto]"
    >
      <div className="flex flex-col gap-3.5">
        <span className="mono hidden tracking-mono-wide text-paper/70 md:block">Catálogo global</span>
        <span className="display text-fluid-cta tracking-display">
          Ver todas
          <br />
          las piezas
        </span>
      </div>
      <span className="mono inline-flex min-h-cta items-center justify-center gap-4 whitespace-nowrap border border-paper/40 px-6 py-4">
        {padCount(totalProducts)} referencias <span aria-hidden>→</span>
      </span>
    </Link>
  );
}
