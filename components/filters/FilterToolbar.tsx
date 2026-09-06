"use client";

import type { SortOption } from "@/lib/types/filters";
import type { GridDensity } from "@/lib/types/grid";
import { padCount } from "@/lib/utils/format";
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
 * Barra sticky de resultados del handoff (papel translúcido + blur, mono):
 * a la izquierda el botón "Filtros / NN" —solo por debajo de `lg`, donde el
 * sidebar es un drawer— y el contador; a la derecha, densidad y orden. Los
 * filtros y el orden siguen visibles y accesibles siempre.
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
  return (
    <div className="mono sticky top-header z-40 flex min-h-[52px] items-center justify-between gap-3.5 border-b border-line bg-paper/95 px-[clamp(14px,3.5vw,24px)] py-2 backdrop-blur-[8px]">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onOpenFilters}
          className="flex min-h-hit items-center gap-3 bg-ink px-4 text-fg-inverse transition-colors duration-fast ease-zara hover:bg-fg-hover lg:hidden"
        >
          <span>Filtros / {padCount(activeFilterCount)}</span>
          <span aria-hidden>+</span>
        </button>
        <p className="text-ink">
          <AnimatedCounter value={resultCount} pad />{" "}
          {resultCount === 1 ? "resultado" : "resultados"}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <GridDensityToggle value={density} onChange={onDensityChange} />
        <SortDropdown value={sort} onChange={onSortChange} />
      </div>
    </div>
  );
}
