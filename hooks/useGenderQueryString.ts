"use client";

import { useSearchParams } from "next/navigation";
import { FILTER_PARAM, isGenderOption } from "@/lib/types/filters";

/**
 * Sufijo `?gender=woman` (o "") para anexar a los `href` de navegación
 * interna (cards de marca/producto, nav, breadcrumbs), de forma que el
 * selector global de género persista al navegar entre páginas — un
 * `<Link>` sin esto perdería el `gender` de la URL actual.
 *
 * Deliberadamente más ligero que `useProductFilters` (no trae router/
 * transition): solo lee, no escribe.
 */
export function useGenderQueryString(): string {
  const searchParams = useSearchParams();
  const gender = searchParams.get(FILTER_PARAM.gender);
  return isGenderOption(gender) ? `?${FILTER_PARAM.gender}=${gender}` : "";
}
