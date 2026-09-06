"use client";

import { useEffect, useMemo, useState } from "react";
import type { Brand, Category, CategoryNode } from "@/lib/types";
import type { ProductFilters } from "@/lib/types/filters";
import { padCount } from "@/lib/utils/format";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Button } from "@/components/ui/Button";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { SearchInput } from "./SearchInput";
import { AccordionSection } from "./AccordionSection";
import { CategoryTreeFilter } from "./CategoryTreeFilter";
import { PriceRangeSlider } from "./PriceRangeSlider";
import { BrandChecklist } from "./BrandChecklist";
import { ToggleFilter } from "./ToggleFilter";

interface DraftFilters {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  available?: boolean;
  onSale?: boolean;
  brandIds?: string[];
}

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  categoryTree: CategoryNode[];
  categories: Category[];
  brands?: Brand[];
  lockedBrandId?: string;
  committedFilters: ProductFilters;
  onApply: (draft: DraftFilters) => void;
  onClear: () => void;
}

function draftFromCommitted(filters: ProductFilters): DraftFilters {
  return {
    search: filters.search,
    categoryId: filters.categoryId,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    available: filters.available,
    onSale: filters.onSale,
    brandIds: filters.brandIds,
  };
}

/**
 * Panel de filtros. En desktop (`lg`) es el sidebar sticky del handoff, a la
 * izquierda del grid y siempre visible; por debajo, un drawer que entra por
 * la derecha (`open`/`onClose`), porque el panel plegable en flujo del
 * prototipo empujaría el grid entero hacia abajo en cada apertura.
 *
 * Un solo árbol para ambos: el mismo nodo cambia de `fixed` + translate a
 * `static` con las utilidades `lg:`. Por eso la entrada/salida del drawer
 * va en transición CSS y no en Framer — Framer animaría `x` también en
 * desktop, donde el panel tiene que quedarse quieto.
 *
 * Los cambios se acumulan en un estado local ("draft") — no tocan la URL
 * hasta pulsar "Ver X resultados" (o "Borrar filtros"). Mientras tanto, el
 * contador del footer se actualiza en vivo contra Supabase (con debounce).
 */
export function FilterDrawer({
  open,
  onClose,
  categoryTree,
  categories,
  brands,
  lockedBrandId,
  committedFilters,
  onApply,
  onClear,
}: FilterDrawerProps) {
  const [draft, setDraft] = useState<DraftFilters>(() =>
    draftFromCommitted(committedFilters),
  );
  const [liveCount, setLiveCount] = useState<number | null>(null);
  const [isCounting, setIsCounting] = useState(false);

  // Reinicia el draft al valor comprometido (URL) cuando cambian los
  // filtros aplicados (chips, borrar) o al abrir el drawer móvil, para que
  // el panel refleje siempre el estado real.
  useEffect(() => {
    setDraft(draftFromCommitted(committedFilters));
  }, [committedFilters]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  const debouncedDraft = useDebouncedValue(draft, 300);

  useEffect(() => {
    let cancelled = false;
    setIsCounting(true);

    (async () => {
      const [{ getProductsCount, getCategoryDescendantIds }, { supabase }] =
        await Promise.all([
          import("@/lib/supabase/queries"),
          import("@/lib/supabase/client"),
        ]);

      const mergedFilters: ProductFilters = {
        ...committedFilters,
        search: debouncedDraft.search,
        categoryId: debouncedDraft.categoryId,
        minPrice: debouncedDraft.minPrice,
        maxPrice: debouncedDraft.maxPrice,
        available: debouncedDraft.available,
        onSale: debouncedDraft.onSale,
        brandIds: lockedBrandId ? undefined : debouncedDraft.brandIds,
      };
      const categoryIds = mergedFilters.categoryId
        ? getCategoryDescendantIds(mergedFilters.categoryId, categories)
        : undefined;

      try {
        const count = await getProductsCount(supabase, mergedFilters, categoryIds);
        if (!cancelled) setLiveCount(count);
      } finally {
        if (!cancelled) setIsCounting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDraft, committedFilters.gender, committedFilters.brandId]);

  const hasDraftFilters = useMemo(
    () =>
      Boolean(draft.search) ||
      Boolean(draft.categoryId) ||
      draft.minPrice !== undefined ||
      draft.maxPrice !== undefined ||
      draft.available === true ||
      draft.onSale === true ||
      Boolean(draft.brandIds && draft.brandIds.length > 0),
    [draft],
  );

  const draftCount =
    (draft.search ? 1 : 0) +
    (draft.categoryId ? 1 : 0) +
    (draft.minPrice !== undefined || draft.maxPrice !== undefined ? 1 : 0) +
    (draft.available ? 1 : 0) +
    (draft.onSale ? 1 : 0) +
    (lockedBrandId ? 0 : (draft.brandIds?.length ?? 0));

  function handleClear() {
    setDraft({});
    onClear();
  }

  return (
    <>
      {/* Fondo del drawer móvil. */}
      <div
        onClick={onClose}
        aria-hidden
        className={`fixed inset-0 z-40 bg-ink/60 backdrop-blur-[6px] transition-opacity duration-base ease-zara lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        role={open ? "dialog" : undefined}
        aria-modal={open ? "true" : undefined}
        aria-label="Filtros"
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-none flex-col border-l border-line bg-paper sm:max-w-md transition-transform duration-base ease-zara lg:sticky lg:inset-auto lg:top-header lg:z-auto lg:max-h-[calc(100vh-var(--header-h))] lg:w-auto lg:max-w-none lg:translate-x-0 lg:border-l-0 lg:border-r ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mono flex shrink-0 items-center justify-between gap-3 border-b border-line px-5 py-4 tracking-mono-wide">
          <span>Filtros / {padCount(draftCount)}</span>
          <button
            type="button"
            onClick={handleClear}
            disabled={!hasDraftFilters}
            className="link-quiet hidden text-text-3 hover:text-ink disabled:opacity-40 lg:block"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar filtros"
            className="link-quiet flex h-11 w-11 items-center justify-center text-[15px] text-ink lg:hidden"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          <div className="py-5">
            <SearchInput
              value={draft.search ?? ""}
              onChange={(value) =>
                setDraft((d) => ({ ...d, search: value || undefined }))
              }
            />
          </div>

          <AccordionSection title="Categoría" index={1} defaultOpen>
            <CategoryTreeFilter
              tree={categoryTree}
              value={draft.categoryId ?? ""}
              onChange={(value) =>
                setDraft((d) => ({ ...d, categoryId: value || undefined }))
              }
            />
          </AccordionSection>

          <AccordionSection title="Precio" index={2}>
            <PriceRangeSlider
              min={draft.minPrice}
              max={draft.maxPrice}
              onChange={({ min, max }) =>
                setDraft((d) => ({ ...d, minPrice: min, maxPrice: max }))
              }
            />
          </AccordionSection>

          <AccordionSection title="Disponibilidad" index={3} defaultOpen>
            <div className="flex flex-col gap-2">
              <ToggleFilter
                label="Solo disponibles"
                active={draft.available === true}
                onToggle={() =>
                  setDraft((d) => ({
                    ...d,
                    available: d.available === true ? undefined : true,
                  }))
                }
              />
              <ToggleFilter
                label="Solo rebajas"
                active={draft.onSale === true}
                onToggle={() =>
                  setDraft((d) => ({
                    ...d,
                    onSale: d.onSale === true ? undefined : true,
                  }))
                }
              />
            </div>
          </AccordionSection>

          {!lockedBrandId && brands ? (
            <AccordionSection
              title="Marca"
              index={4}
              badge={
                draft.brandIds && draft.brandIds.length > 0
                  ? padCount(draft.brandIds.length)
                  : null
              }
            >
              <BrandChecklist
                brands={brands}
                selected={draft.brandIds ?? []}
                onChange={(ids) => setDraft((d) => ({ ...d, brandIds: ids }))}
              />
            </AccordionSection>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-line px-5 py-4">
          <Button
            variant="link"
            onClick={handleClear}
            disabled={!hasDraftFilters}
            className="lg:hidden"
          >
            Borrar
          </Button>
          <Button variant="solid" onClick={() => onApply(draft)} className="flex-1">
            Ver{" "}
            {liveCount === null ? (
              "…"
            ) : (
              <span className={isCounting ? "opacity-50" : ""}>
                <AnimatedCounter value={liveCount} />
              </span>
            )}{" "}
            resultados
          </Button>
        </div>
      </aside>
    </>
  );
}
