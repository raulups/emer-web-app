"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { PRICE_BOUNDS } from "@/lib/types/filters";

interface PriceRangeSliderProps {
  min: number | undefined;
  max: number | undefined;
  onChange: (range: { min: number | undefined; max: number | undefined }) => void;
}

/**
 * Doble slider de rango de precio, sincronizado con inputs numéricos.
 * Se implementa con dos <input type="range"> nativos superpuestos (técnica
 * habitual para un dual-range sin dependencias): cada uno controla un thumb,
 * y el "track" relleno de por medio se dibuja aparte según ambos valores.
 * Actualiza en tiempo real con debounce, igual que el resto de filtros.
 */
export function PriceRangeSlider({ min, max, onChange }: PriceRangeSliderProps) {
  const { min: BOUND_MIN, max: BOUND_MAX } = PRICE_BOUNDS;

  const [draftMin, setDraftMin] = useState(min ?? BOUND_MIN);
  const [draftMax, setDraftMax] = useState(max ?? BOUND_MAX);
  const debouncedMin = useDebouncedValue(draftMin, 350);
  const debouncedMax = useDebouncedValue(draftMax, 350);

  useEffect(() => {
    setDraftMin(min ?? BOUND_MIN);
  }, [min, BOUND_MIN]);
  useEffect(() => {
    setDraftMax(max ?? BOUND_MAX);
  }, [max, BOUND_MAX]);

  useEffect(() => {
    const nextMin = debouncedMin <= BOUND_MIN ? undefined : debouncedMin;
    const nextMax = debouncedMax >= BOUND_MAX ? undefined : debouncedMax;
    if (nextMin !== (min ?? undefined) || nextMax !== (max ?? undefined)) {
      onChange({ min: nextMin, max: nextMax });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMin, debouncedMax]);

  const minPercent = ((draftMin - BOUND_MIN) / (BOUND_MAX - BOUND_MIN)) * 100;
  const maxPercent = ((draftMax - BOUND_MIN) / (BOUND_MAX - BOUND_MIN)) * 100;

  return (
    <div>
      <div className="relative h-4">
        <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-line" />
        <div
          className="absolute top-1/2 h-[2px] -translate-y-1/2 bg-ink"
          style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
        />
        <input
          type="range"
          min={BOUND_MIN}
          max={BOUND_MAX}
          value={draftMin}
          onChange={(e) => {
            const next = Math.min(Number(e.target.value), draftMax);
            setDraftMin(next);
          }}
          aria-label="Precio mínimo"
          className="range-thumb pointer-events-none absolute inset-x-0 top-1/2 h-4 w-full -translate-y-1/2 appearance-none bg-transparent"
          style={{ zIndex: draftMin > BOUND_MAX - 100 ? 5 : 3 }}
        />
        <input
          type="range"
          min={BOUND_MIN}
          max={BOUND_MAX}
          value={draftMax}
          onChange={(e) => {
            const next = Math.max(Number(e.target.value), draftMin);
            setDraftMax(next);
          }}
          aria-label="Precio máximo"
          className="range-thumb pointer-events-none absolute inset-x-0 top-1/2 h-4 w-full -translate-y-1/2 appearance-none bg-transparent"
          style={{ zIndex: 4 }}
        />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Input
          type="number"
          inputMode="decimal"
          min={BOUND_MIN}
          value={draftMin}
          onChange={(e) => setDraftMin(Math.min(Number(e.target.value) || 0, draftMax))}
          aria-label="Precio mínimo exacto"
        />
        <span className="text-muted">—</span>
        <Input
          type="number"
          inputMode="decimal"
          min={BOUND_MIN}
          value={draftMax}
          onChange={(e) =>
            setDraftMax(Math.max(Number(e.target.value) || 0, draftMin))
          }
          aria-label="Precio máximo exacto"
        />
      </div>
    </div>
  );
}
