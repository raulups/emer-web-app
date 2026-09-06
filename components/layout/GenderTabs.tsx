"use client";

import { GENDER_OPTIONS } from "@/lib/types/filters";
import { useProductFilters } from "@/hooks/useProductFilters";

/**
 * Selector de contexto global Mujer/Hombre/Todo. Reutiliza directamente
 * `useProductFilters` (sin `brandId`): solo lee/escribe query params, así
 * que sirve igual aquí que en la barra de filtros — el `gender` que fija
 * queda en la URL y viaja con cualquier navegación que lo preserve (ver
 * `useGenderQueryString`).
 *
 * Mono, mayúsculas, sin fondo de color: la pestaña activa se marca con el
 * punto de 5px del handoff (el mismo que usan sus pastillas de orden).
 */
export function GenderTabs() {
  const { filters, setParams } = useProductFilters();

  const options = [
    ...GENDER_OPTIONS.map((option) => ({
      label: option.label,
      active: filters.gender === option.value,
      select: () =>
        setParams({ gender: filters.gender === option.value ? undefined : option.value }),
    })),
    {
      label: "Todo",
      active: !filters.gender,
      select: () => setParams({ gender: undefined }),
    },
  ];

  return (
    <nav aria-label="Filtrar por género" className="mono flex items-center gap-[clamp(12px,3vw,22px)]">
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          onClick={option.select}
          aria-pressed={option.active}
          className={`link-quiet flex min-h-hit items-center gap-2 ${
            option.active ? "text-ink" : "text-text-3"
          }`}
        >
          <span
            aria-hidden
            className={`h-[5px] w-[5px] bg-ink transition-opacity duration-fast ease-zara ${
              option.active ? "opacity-100" : "opacity-0"
            }`}
          />
          {option.label}
        </button>
      ))}
    </nav>
  );
}
