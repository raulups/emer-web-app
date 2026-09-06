"use client";

import Link from "next/link";
import { useGenderQueryString } from "@/hooks/useGenderQueryString";
import { GenderTabs } from "./GenderTabs";

/**
 * Header del sitio: fila superior con el selector Mujer/Hombre/Todo
 * (contexto global) y, debajo, la fila principal con el wordmark serif y la
 * navegación. Ambas van dentro de un único contenedor sticky (se mueven
 * juntas); su alto total está en `--header-h` para que la barra de filtros
 * y la galería del detalle puedan anclarse debajo sin números mágicos.
 *
 * Es Client Component porque el selector de género y los links de nav
 * dependen de la URL actual (useSearchParams) — se monta desde el layout
 * dentro de un <Suspense> (ver SiteHeaderFallback).
 */
export function SiteHeader() {
  const genderQuery = useGenderQueryString();

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper">
      <div className="border-b border-line">
        <GenderTabs />
      </div>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        <Link href={`/${genderQuery}`} className="wordmark text-2xl text-ink">
          Catálogo
        </Link>
        <nav className="flex items-center gap-8">
          <Link
            href={`/${genderQuery}`}
            className="link-underline text-ui uppercase tracking-ui text-ink"
          >
            Marcas
          </Link>
          <Link
            href={`/products${genderQuery}`}
            className="link-underline text-ui uppercase tracking-ui text-ink"
          >
            Productos
          </Link>
        </nav>
      </div>
    </header>
  );
}
