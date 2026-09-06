"use client";

import { GENDER_OPTIONS } from "@/lib/types/filters";
import { useProductFilters } from "@/hooks/useProductFilters";

/**
 * Selector de contexto global Mujer/Hombre/Todo. Reutiliza directamente
 * `useProductFilters` (sin `brandId`): es genérico, solo lee/escribe query
 * params, así que sirve igual aquí que en la barra de filtros de listado —
 * el `gender` que fija queda en la URL y viaja con cualquier navegación que
 * lo preserve (ver `useGenderQueryString`, usado por los links de card/nav).
 *
 * Mayúsculas + tracking de UI, sin fondo de color: la pestaña activa se
 * marca con subrayado, nunca con color.
 */
const TAB_BASE =
  "border-b-2 pb-0.5 text-ui uppercase tracking-ui transition-colors duration-fast ease-zara";

export function GenderTabs() {
  const { filters, setParams } = useProductFilters();

  return (
    <nav
      aria-label="Filtrar por género"
      className="mx-auto flex h-10 max-w-7xl items-center justify-center gap-8 px-4 sm:px-8"
    >
      {GENDER_OPTIONS.map((option) => {
        const active = filters.gender === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setParams({ gender: active ? undefined : option.value })}
            aria-pressed={active}
            className={`${TAB_BASE} ${
              active
                ? "border-ink text-ink"
                : "border-transparent text-muted-text hover:text-ink"
            }`}
          >
            {option.label}
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => setParams({ gender: undefined })}
        aria-pressed={!filters.gender}
        className={`${TAB_BASE} ${
          !filters.gender
            ? "border-ink text-ink"
            : "border-transparent text-muted-text hover:text-ink"
        }`}
      >
        Todo
      </button>
    </nav>
  );
}
