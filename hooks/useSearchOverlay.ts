"use client";

import { createContext, createElement, useContext, useMemo, useState, type ReactNode } from "react";

interface SearchOverlayState {
  open: boolean;
  openSearch: () => void;
  closeSearch: () => void;
}

const SearchOverlayContext = createContext<SearchOverlayState | null>(null);

/**
 * Estado abierto/cerrado del buscador full-screen, compartido: lo abre el
 * botón BUSCAR del header pero también el enlace "Buscar marca" del índice
 * de la home, y el overlay se monta una sola vez (en SiteHeader). Sin un
 * contexto, la home no tendría forma de llegar al estado del header.
 */
export function SearchOverlayProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const value = useMemo<SearchOverlayState>(
    () => ({
      open,
      openSearch: () => setOpen(true),
      closeSearch: () => setOpen(false),
    }),
    [open],
  );

  return createElement(SearchOverlayContext.Provider, { value }, children);
}

export function useSearchOverlay(): SearchOverlayState {
  const context = useContext(SearchOverlayContext);
  if (!context) {
    throw new Error("useSearchOverlay debe usarse dentro de <SearchOverlayProvider>.");
  }
  return context;
}
