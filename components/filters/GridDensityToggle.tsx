"use client";

import { GRID_DENSITIES, type GridDensity } from "@/lib/types/grid";

interface GridDensityToggleProps {
  value: GridDensity;
  onChange: (density: GridDensity) => void;
}

/** Densidad del grid: compacta (4 col.) / estándar (3) / amplia (2) en desktop. */
export function GridDensityToggle({ value, onChange }: GridDensityToggleProps) {
  return (
    <div
      role="group"
      aria-label="Densidad de la rejilla"
      className="hidden items-center border border-line md:flex"
    >
      {GRID_DENSITIES.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            title={option.label}
            className={`flex h-11 w-11 items-center justify-center transition-colors duration-fast ease-zara ${
              active ? "bg-ink text-fg-inverse" : "text-text-3 hover:text-ink"
            }`}
          >
            <DensityIcon density={option.value} />
            <span className="sr-only">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Glifo de columnas: 4 barras (compacta), 3 (estándar), 2 (amplia). */
function DensityIcon({ density }: { density: GridDensity }) {
  const columns = density === "compact" ? 4 : density === "standard" ? 3 : 2;
  const gap = 1.5;
  const total = 14;
  const width = (total - gap * (columns - 1)) / columns;

  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      {Array.from({ length: columns }).map((_, i) => (
        <rect
          key={i}
          x={i * (width + gap)}
          y={0}
          width={width}
          height={14}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}
