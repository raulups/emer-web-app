import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  tone?: "default" | "sale" | "unavailable";
}

/**
 * Etiqueta informativa, NO interactiva. Se distingue a propósito de los
 * elementos clicables: caja con borde/relleno plano, sin subrayado y sin
 * estado hover (los clicables llevan `.link-underline` o borde que reacciona).
 */
const TONE_CLASSES: Record<NonNullable<BadgeProps["tone"]>, string> = {
  default: "border-ink text-ink",
  // Único uso del acento rojo en toda la app.
  sale: "border-accent bg-accent text-fg-inverse",
  unavailable: "border-line bg-paper text-muted-text",
};

export function Badge({ children, tone = "default" }: BadgeProps) {
  return (
    <span
      className={`inline-flex cursor-default select-none items-center border px-2 py-0.5 text-ui uppercase tracking-ui ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
