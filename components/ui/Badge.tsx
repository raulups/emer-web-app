import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  tone?: "default" | "sale" | "unavailable";
}

/**
 * Etiqueta informativa, NO interactiva: caja mono plana, sin hover ni
 * atenuación (los clicables llevan `.link-quiet` o un borde que reacciona).
 *
 * `sale` va en bloque negro, no en rojo: el handoff no tiene acentos —"el
 * color lo aporta la fotografía"— y la jerarquía se construye con
 * inversiones de negro/papel.
 */
const TONE_CLASSES: Record<NonNullable<BadgeProps["tone"]>, string> = {
  default: "border-ink bg-paper/95 text-ink",
  sale: "border-ink bg-ink text-fg-inverse",
  unavailable: "border-line bg-paper/95 text-text-3",
};

export function Badge({ children, tone = "default" }: BadgeProps) {
  return (
    <span
      className={`mono inline-flex cursor-default select-none items-center border px-2.5 py-1 ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
