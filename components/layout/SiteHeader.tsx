"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useGenderQueryString } from "@/hooks/useGenderQueryString";
import { useSearchOverlay } from "@/hooks/useSearchOverlay";
import { AuthButton } from "@/components/auth/AuthButton";
import { GenderTabs } from "./GenderTabs";

/**
 * El buscador full-screen se carga al abrirlo por primera vez: es un overlay
 * que la mayoría de visitas no llega a usar, y así su código (y la lista de
 * marcas que pide) no viaja en el bundle inicial de todas las páginas.
 */
const SearchOverlay = dynamic(
  () => import("./SearchOverlay").then((m) => m.SearchOverlay),
  { ssr: false },
);

/**
 * Navbar fijo del handoff: 54px, papel translúcido con blur, wordmark a la
 * izquierda y navegación mono a la derecha separada por líneas verticales:
 * MARCAS · CATÁLOGO | BUSCAR | sesión.
 *
 * El selector Mujer/Hombre/Todo —que el handoff no tiene y el proyecto
 * conserva a propósito— va integrado en esa misma fila en desktop y baja a
 * una segunda fila de 40px en móvil; `--header-h` cambia con él para que las
 * barras sticky de debajo se anclen donde toca.
 *
 * Es Client Component porque el selector de género y los links de nav
 * dependen de la URL actual (useSearchParams) — se monta desde el layout
 * dentro de un <Suspense> (ver SiteHeaderFallback).
 */
export function SiteHeader() {
  const genderQuery = useGenderQueryString();
  const { open: searchOpen, openSearch, closeSearch } = useSearchOverlay();

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[60] border-b border-line bg-paper/90 backdrop-blur-[10px]">
        <div className="flex h-[54px] items-center justify-between gap-3.5 px-page">
          <Link
            href={`/${genderQuery}`}
            className="wordmark link-quiet flex min-h-hit items-center text-[clamp(14px,3.4vw,15px)] text-ink"
          >
            Catálogo<span className="hidden md:inline">&nbsp;/&nbsp;ES</span>
          </Link>

          <div className="mono flex items-center gap-[clamp(6px,3vw,26px)]">
            <div className="hidden border-r border-line pr-[clamp(12px,3vw,22px)] md:block">
              <GenderTabs />
            </div>

            <nav aria-label="Principal" className="flex items-center gap-[clamp(12px,3vw,26px)]">
              <Link
                href={`/${genderQuery}`}
                className="link-quiet hidden min-h-hit items-center text-ink md:flex"
              >
                Marcas
              </Link>
              <Link
                href={`/products${genderQuery}`}
                className="link-quiet flex min-h-hit items-center text-ink"
              >
                Catálogo
              </Link>
            </nav>

            <button
              type="button"
              onClick={openSearch}
              className="link-quiet flex min-h-hit min-w-hit items-center justify-center gap-2.5 border-l border-line pl-[clamp(10px,3vw,22px)] text-ink md:min-w-0 md:justify-start"
              aria-label="Buscar marca"
            >
              <SearchGlyph />
              <span className="hidden md:inline">Buscar</span>
            </button>

            {/* Fuera del <nav>: no es navegación, es estado de sesión. */}
            <div className="border-l border-line pl-[clamp(10px,3vw,22px)]">
              <AuthButton />
            </div>
          </div>
        </div>

        <div className="flex h-10 items-center border-t border-line px-page md:hidden">
          <GenderTabs />
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={closeSearch} />
    </>
  );
}

/** La lupa del handoff: círculo de 13px con borde 1.5px y mango rotado 45°. */
function SearchGlyph() {
  return (
    <span
      aria-hidden
      className="relative inline-block h-[13px] w-[13px] rounded-full border-[1.5px] border-current"
    >
      <span className="absolute -bottom-1 -right-[5px] h-[1.5px] w-[7px] rotate-45 bg-current" />
    </span>
  );
}
