import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * `outline` y `link` son el lenguaje por defecto del sistema (borde de 1px
   * o texto subrayado, sin relleno). `solid` es la excepción funcional
   * reservada a dos CTAs concretos —"Ver X resultados" del drawer y el botón
   * de compra directa de la card—; no usarlo en otros sitios.
   */
  variant?: "solid" | "outline" | "link";
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  solid: "border border-ink bg-ink text-fg-inverse hover:bg-paper hover:text-ink",
  outline: "border border-line text-ink hover:border-ink",
  link: "border-b border-ink px-0 text-ink hover:opacity-60",
};

/** Botón base: sin radio, sin sombra, transición de color en --dur-fast. */
export function Button({
  variant = "outline",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center px-5 py-2.5 text-ui uppercase tracking-ui transition-colors duration-fast ease-zara disabled:cursor-not-allowed disabled:opacity-40 ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
