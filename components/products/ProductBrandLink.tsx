"use client";

import Link from "next/link";
import { useGenderQueryString } from "@/hooks/useGenderQueryString";

interface ProductBrandLinkProps {
  brandId: string;
  brandName: string;
}

/** Link a la marca dentro de la ficha de producto, preservando el género activo. */
export function ProductBrandLink({ brandId, brandName }: ProductBrandLinkProps) {
  const genderQuery = useGenderQueryString();

  return (
    <Link
      href={`/brands/${brandId}${genderQuery}`}
      className="link-underline mt-3 inline-block text-ui uppercase tracking-ui text-muted-text"
    >
      {brandName}
    </Link>
  );
}
