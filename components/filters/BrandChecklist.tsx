"use client";

import { useMemo, useState } from "react";
import type { Brand } from "@/lib/types";
import { Input } from "@/components/ui/Input";

interface BrandChecklistProps {
  brands: Brand[];
  selected: string[];
  onChange: (ids: string[]) => void;
}

/** Checklist de marcas (multi-select) con buscador — solo se usa en /products. */
export function BrandChecklist({ brands, selected, onChange }: BrandChecklistProps) {
  const [query, setQuery] = useState("");

  const filteredBrands = useMemo(() => {
    if (!query.trim()) return brands;
    const q = query.trim().toLowerCase();
    return brands.filter((b) => b.name.toLowerCase().includes(q));
  }, [brands, query]);

  function toggle(id: string) {
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id],
    );
  }

  return (
    <div>
      {brands.length > 8 ? (
        <Input
          type="search"
          placeholder="Buscar marca…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar marca"
          className="mb-3"
        />
      ) : null}
      <ul className="max-h-64 space-y-1 overflow-y-auto">
        {filteredBrands.map((brand) => {
          const checked = selected.includes(brand.id);
          return (
            <li key={brand.id}>
              <label className="flex cursor-pointer items-center gap-3 py-1.5 text-ui">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(brand.id)}
                  className="h-4 w-4 shrink-0 rounded-none accent-ink"
                />
                <span className={checked ? "text-ink" : "text-muted-text"}>
                  {brand.name}
                </span>
              </label>
            </li>
          );
        })}
        {filteredBrands.length === 0 ? (
          <li className="py-2 text-ui text-muted-text">
            Sin resultados para “{query}”.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
