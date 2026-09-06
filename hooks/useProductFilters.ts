"use client";

import { useCallback, useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  parseProductFilters,
  type FilterParamsPatch,
  type FilterSearchParams,
  type ProductFilters,
} from "@/lib/types/filters";

/**
 * Lee los filtros/orden activos desde la URL y expone un setter que
 * actualiza la URL (query params), disparando un nuevo fetch en el
 * Server Component de la página. Los filtros combinables se reflejan
 * siempre en la URL para poder compartir/recargar.
 *
 * La navegación va envuelta en `useTransition`: `isPending` queda en true
 * mientras el Server Component resuelve los nuevos datos, para poder pintar
 * un overlay sobre el grid ya montado sin bloquear la interacción ni tocar
 * el scroll (el push ya va con `scroll: false`).
 */
export function useProductFilters(options?: { brandId?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const searchParamsObject = useMemo<FilterSearchParams>(() => {
    const entries: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      entries[key] = value;
    });
    return entries;
  }, [searchParams]);

  const filters: ProductFilters = useMemo(
    () => parseProductFilters(searchParamsObject, options),
    [searchParamsObject, options],
  );

  const setParams = useCallback(
    (patch: FilterParamsPatch) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const query = params.toString();
      const href = query ? `${pathname}?${query}` : pathname;
      startTransition(() => {
        router.push(href, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  const resetFilters = useCallback(() => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }, [pathname, router]);

  return { filters, setParams, resetFilters, isPending };
}
