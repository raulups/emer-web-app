"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Brand, Category, CategoryNode } from "@/lib/types";
import type { ProductFilters } from "@/lib/types/filters";
import { DUR, EASE, EASE_OUT } from "@/lib/motion";
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
 * Panel de filtros deslizante desde la derecha (overlay a pantalla completa
 * en mobile), con secciones en acordeón. Los cambios se acumulan en un
 * estado local ("draft") — no tocan la URL hasta pulsar "Ver X resultados"
 * (o "Borrar filtros", que limpia y aplica de golpe). Mientras tanto, el
 * contador del footer se actualiza en vivo contra Supabase (con debounce),
 * para previsualizar cuántos resultados daría el draft antes de aplicarlo.
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

  // Reinicia el draft al valor comprometido (URL) cada vez que el drawer se
  // abre, para que refleje el estado real si se había cerrado sin aplicar.
  useEffect(() => {
    if (open) setDraft(draftFromCommitted(committedFilters));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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
    if (!open) return;
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
  }, [open, debouncedDraft, committedFilters.gender, committedFilters.brandId]);

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

  function handleApply() {
    onApply(draft);
  }

  function handleClear() {
    setDraft({});
    onClear();
  }

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: DUR.fast, ease: EASE_OUT } }}
            transition={{ duration: DUR.base, ease: EASE }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-ink/40"
            aria-hidden
          />
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label="Filtrar y ordenar"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%", transition: { duration: DUR.fast, ease: EASE_OUT } }}
            transition={{ duration: DUR.base, ease: EASE }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-line bg-paper"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-5">
              <h2 className="text-ui uppercase tracking-ui text-ink">
                Filtrar y ordenar
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar filtros"
                className="flex h-8 w-8 items-center justify-center text-ink transition-opacity duration-fast ease-zara hover:opacity-60"
              >
                <CloseIcon />
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

              <AccordionSection title="Disponibilidad" index={3}>
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
              </AccordionSection>

              <AccordionSection title="Oferta" index={4}>
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
              </AccordionSection>

              {!lockedBrandId && brands ? (
                <AccordionSection
                  title="Marca"
                  index={5}
                  badge={
                    draft.brandIds && draft.brandIds.length > 0 ? (
                      <span className="border border-ink px-1.5 text-ui tracking-ui text-ink">
                        {draft.brandIds.length}
                      </span>
                    ) : null
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

            <div className="flex shrink-0 items-center justify-between gap-4 border-t border-line px-5 py-5">
              <Button
                variant="link"
                onClick={handleClear}
                disabled={!hasDraftFilters}
              >
                Borrar filtros
              </Button>
              {/* Excepción funcional al lenguaje editorial: relleno sólido. */}
              <Button variant="solid" onClick={handleApply} className="flex-1">
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
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M1 1L13 13M13 1L1 13"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
