"use client";

import { useState } from "react";
import type { SizeOption } from "@/lib/types";

interface SizeGridProps {
  sizes: SizeOption[];
}

/**
 * Selector de tallas en cuadrícula: las que no tienen stock se muestran
 * atenuadas y tachadas (no se eliminan de la lista, para que el usuario
 * sepa que la talla existe aunque ahora no haya existencias).
 */
export function SizeGrid({ sizes }: SizeGridProps) {
  const [selected, setSelected] = useState<string | null>(null);

  if (sizes.length === 0) return null;

  return (
    <div>
      <p className="text-ui uppercase tracking-ui text-ink">Tallas</p>
      <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
        {sizes.map((size, index) => {
          const isSelected = selected === size.label;
          return (
            <button
              key={`${size.label}-${index}`}
              type="button"
              disabled={!size.available}
              aria-pressed={isSelected}
              onClick={() => setSelected(size.label)}
              className={`flex h-11 items-center justify-center border text-ui tracking-ui transition-colors duration-fast ease-zara ${
                !size.available
                  ? "cursor-not-allowed border-line text-muted-text"
                  : isSelected
                    ? "border-ink bg-ink text-fg-inverse"
                    : "border-line text-ink hover:border-ink"
              }`}
            >
              <span className={!size.available ? "line-through" : ""}>
                {size.label}
              </span>
            </button>
          );
        })}
      </div>
      {sizes.every((s) => !s.available) ? (
        <p className="mt-3 text-ui text-muted-text">
          Sin stock en ninguna talla ahora mismo.
        </p>
      ) : null}
    </div>
  );
}
