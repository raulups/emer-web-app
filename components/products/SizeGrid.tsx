"use client";

import { useState } from "react";
import type { SizeOption } from "@/lib/types";

interface SizeGridProps {
  sizes: SizeOption[];
}

/**
 * Tallas con la anatomía del modal del handoff: botones mono de 52×46px con
 * borde en --fg, la seleccionada invertida, y debajo la línea de estado
 * ("Selecciona una talla…" → "Talla M · disponible en la web de la marca").
 * Las tallas sin stock se muestran atenuadas y tachadas, no se ocultan.
 *
 * La selección es informativa: aquí no hay cesta, la compra sale a la web
 * de la marca.
 */
export function SizeGrid({ sizes }: SizeGridProps) {
  const [selected, setSelected] = useState<string | null>(null);

  if (sizes.length === 0) return null;

  const allOut = sizes.every((s) => !s.available);

  return (
    <div className="flex flex-col gap-3">
      <p className="mono tracking-mono-wide text-text-3">Tallas disponibles</p>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size, index) => {
          const isSelected = selected === size.label;
          return (
            <button
              key={`${size.label}-${index}`}
              type="button"
              disabled={!size.available}
              aria-pressed={isSelected}
              onClick={() => setSelected(size.label)}
              className={`mono flex min-h-[46px] min-w-[52px] items-center justify-center border px-2.5 py-3 tracking-[0.1em] transition-colors duration-fast ease-zara ${
                !size.available
                  ? "cursor-not-allowed border-line text-text-3"
                  : isSelected
                    ? "border-ink bg-ink text-fg-inverse"
                    : "border-ink text-ink hover:bg-ink hover:text-fg-inverse"
              }`}
            >
              <span className={!size.available ? "line-through" : ""}>{size.label}</span>
            </button>
          );
        })}
      </div>
      <p className="mono text-text-3" aria-live="polite">
        {allOut
          ? "Sin stock en ninguna talla ahora mismo"
          : selected
            ? `Talla ${selected} · disponible en la web de la marca`
            : "Selecciona una talla para ver disponibilidad"}
      </p>
    </div>
  );
}
