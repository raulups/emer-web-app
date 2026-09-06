"use client";

import { useEffect, useState } from "react";
import type { SortOption } from "@/lib/types/filters";
import type { GridDensity } from "@/lib/types/grid";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { SortDropdown } from "./SortDropdown";
import { GridDensityToggle } from "./GridDensityToggle";

interface FilterToolbarProps {
  resultCount: number;
  activeFilterCount: number;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  onOpenFilters: () => void;
  density: GridDensity;
  onDensityChange: (density: GridDensity) => void;
}

/**
 * Barra sticky justo debajo del header: botón "Filtrar y ordenar" (visible,
 * con icono — deliberadamente lo opuesto al filtro casi invisible de
 * Zara.com real), contador de resultados, densidad de rejilla y orden.
 *
 * Al pegarse arriba aparece un borde inferior más marcado en vez de una
 * sombra: el sistema no usa `box-shadow` en ningún sitio.
 */
export function FilterToolbar({
  resultCount,
  activeFilterCount,
  sort,
  onSortChange,
  onOpenFilters,
  density,
  onDensityChange,
}: FilterToolbarProps) {
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsStuck(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`sticky top-header z-[5] -mx-4 flex items-center justify-between gap-4 bg-paper px-4 transition-[border-color,padding] duration-base ease-zara sm:-mx-8 sm:px-8 ${
        isStuck ? "border-b border-ink py-3" : "border-b border-line py-5"
      }`}
    >
      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={onOpenFilters}
          className="flex h-10 items-center gap-2 border border-ink px-4 text-ui uppercase tracking-ui text-ink transition-colors duration-fast ease-zara hover:bg-ink hover:text-fg-inverse"
        >
          <FilterIcon />
          Filtrar y ordenar
          {activeFilterCount > 0 ? (
            <span className="ml-1 border border-current px-1.5 text-ui tracking-ui">
              {activeFilterCount}
            </span>
          ) : null}
        </button>
        <p className="hidden text-ui uppercase tracking-ui text-muted-text sm:block">
          <AnimatedCounter value={resultCount} />{" "}
          {resultCount === 1 ? "producto" : "productos"}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <p className="text-ui uppercase tracking-ui text-muted-text sm:hidden">
          <AnimatedCounter value={resultCount} />
        </p>
        <GridDensityToggle value={density} onChange={onDensityChange} />
        <SortDropdown value={sort} onChange={onSortChange} />
      </div>
    </div>
  );
}

function FilterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M1 2h12M3.5 7h7M6 12h2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
