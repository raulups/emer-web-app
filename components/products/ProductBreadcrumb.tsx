"use client";

import Link from "next/link";
import { useGenderQueryString } from "@/hooks/useGenderQueryString";

interface ProductBreadcrumbProps {
  brand: { id: string; name: string } | null;
}

/** Breadcrumb del detalle de producto, preservando el género activo en los links. */
export function ProductBreadcrumb({ brand }: ProductBreadcrumbProps) {
  const genderQuery = useGenderQueryString();

  return (
    <nav className="mb-8 flex flex-wrap items-center gap-2 text-ui uppercase tracking-ui text-muted-text">
      <Link href={`/products${genderQuery}`} className="link-underline text-ink">
        Productos
      </Link>
      {brand ? (
        <>
          <span aria-hidden>/</span>
          <Link
            href={`/brands/${brand.id}${genderQuery}`}
            className="link-underline text-ink"
          >
            {brand.name}
          </Link>
        </>
      ) : null}
    </nav>
  );
}
