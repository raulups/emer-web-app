"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Brand, CategoryNode } from "@/lib/types";
import type { FilterParamsPatch, ProductFilters } from "@/lib/types/filters";
import { DUR, EASE, EASE_OUT } from "@/lib/motion";
import { formatPrice } from "@/lib/utils/format";

interface ActiveFilterChipsProps {
  filters: ProductFilters;
  categoryTree: CategoryNode[];
  brands?: Brand[];
  onChange: (patch: FilterParamsPatch) => void;
}

interface Chip {
  key: string;
  label: string;
  onRemove: () => void;
}

function findCategoryName(tree: CategoryNode[], id: string): string | null {
  for (const node of tree) {
    if (node.id === id) return node.name;
    const found = findCategoryName(node.children, id);
    if (found) return found;
  }
  return null;
}

/**
 * Chips de filtros activos, debajo de la barra sticky (no forma parte de
 * ella, así que scrollea con la página). Cada chip se puede quitar por
 * separado sin abrir el panel.
 */
export function ActiveFilterChips({
  filters,
  categoryTree,
  brands,
  onChange,
}: ActiveFilterChipsProps) {
  const chips: Chip[] = [];

  if (filters.search) {
    chips.push({
      key: "search",
      label: `“${filters.search}”`,
      onRemove: () => onChange({ q: undefined }),
    });
  }
  if (filters.categoryId) {
    const name = findCategoryName(categoryTree, filters.categoryId) ?? "Categoría";
    chips.push({
      key: "category",
      label: name,
      onRemove: () => onChange({ category: undefined }),
    });
  }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const min = filters.minPrice !== undefined ? formatPrice(filters.minPrice) : "0";
    const max = filters.maxPrice !== undefined ? formatPrice(filters.maxPrice) : "";
    chips.push({
      key: "price",
      label: max ? `${min} – ${max}` : `Desde ${min}`,
      onRemove: () => onChange({ minPrice: undefined, maxPrice: undefined }),
    });
  }
  if (filters.available === true) {
    chips.push({
      key: "available",
      label: "Disponible",
      onRemove: () => onChange({ available: undefined }),
    });
  }
  if (filters.onSale === true) {
    chips.push({
      key: "sale",
      label: "Rebaja",
      onRemove: () => onChange({ sale: undefined }),
    });
  }
  for (const brandId of filters.brandIds ?? []) {
    const brand = brands?.find((b) => b.id === brandId);
    chips.push({
      key: `brand-${brandId}`,
      label: brand?.name ?? "Marca",
      onRemove: () => {
        const remaining = (filters.brandIds ?? []).filter((id) => id !== brandId);
        onChange({ brand: remaining.length > 0 ? remaining.join(",") : undefined });
      },
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 border-b border-line px-[clamp(14px,3.5vw,24px)] py-3">
      <AnimatePresence initial={false}>
        {chips.map((chip) => (
          <motion.button
            key={chip.key}
            type="button"
            onClick={chip.onRemove}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: 6,
              transition: { duration: DUR.fast, ease: EASE_OUT },
            }}
            transition={{ duration: DUR.fast, ease: EASE }}
            className="mono flex min-h-hit items-center gap-2.5 border border-line px-3 md:min-h-[36px] text-ink transition-colors duration-fast ease-zara hover:border-ink"
          >
            <span className="max-w-[16rem] truncate">{chip.label}</span>
            <span aria-hidden className="text-text-3">
              ✕
            </span>
            <span className="sr-only">Quitar filtro</span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
