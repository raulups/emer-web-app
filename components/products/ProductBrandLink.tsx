"use client";

import Link from "next/link";
import { useGenderQueryString } from "@/hooks/useGenderQueryString";

interface ProductBrandLinkProps {
  brandId: string;
  brandName: string;
}

/** Link a la marca en el eyebrow de la ficha, preservando el género activo. */
export function ProductBrandLink({ brandId, brandName }: ProductBrandLinkProps) {
  const genderQuery = useGenderQueryString();

  return (
    <Link href={`/brands/${brandId}${genderQuery}`} className="link-quiet inline-flex min-h-hit items-center text-ink">
      {brandName}
    </Link>
  );
}
