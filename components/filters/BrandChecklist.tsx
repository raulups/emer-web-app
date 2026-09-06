"use client";

import { useMemo, useState } from "react";
import type { Brand } from "@/lib/types";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "./Checkbox";

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
      <ul className="max-h-64 overflow-y-auto">
        {filteredBrands.map((brand) => {
          const checked = selected.includes(brand.id);
          return (
            <li key={brand.id}>
              <label className="flex min-h-hit cursor-pointer items-center gap-[11px] md:min-h-[34px] text-ui uppercase tracking-[0.02em] transition-opacity duration-fast ease-zara hover:opacity-60">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(brand.id)}
                  className="peer sr-only"
                />
                <span className="inline-flex peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-fg">
                  <Checkbox checked={checked} />
                </span>
                <span className={`flex-1 ${checked ? "text-ink" : "text-text-2"}`}>
                  {brand.name}
                </span>
              </label>
            </li>
          );
        })}
        {filteredBrands.length === 0 ? (
          <li className="mono py-2 text-text-3">Sin resultados para “{query}”.</li>
        ) : null}
      </ul>
    </div>
  );
}
