"use client";

import { useSearchOverlay } from "@/hooks/useSearchOverlay";

/** "Buscar marca" del índice de la home: abre el buscador full-screen del header. */
export function SearchBrandLink() {
  const { openSearch } = useSearchOverlay();

  return (
    <button type="button" onClick={openSearch} className="link-quiet text-ink">
      Buscar marca
    </button>
  );
}
