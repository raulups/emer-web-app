import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * `solid` es el bloque negro macizo del handoff (CTAs principales).
   * `outline` es el borde de 1px que pasa a --fg al hover (secundarios).
   * `link` es texto mono que se atenúa al hover (terciarios: cancelar,
   * borrar).
   */
  variant?: "solid" | "outline" | "link";
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  solid: "border border-ink bg-ink text-fg-inverse hover:bg-fg-hover",
  outline: "border border-line text-ink hover:border-ink",
  link: "link-quiet px-0 text-ink",
};

/** Botón base: mono, sin radio, sin sombra, hit target de 48px. */
export function Button({
  variant = "outline",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`mono inline-flex min-h-cta items-center justify-center gap-3 px-6 py-3 transition-colors duration-fast ease-zara disabled:cursor-not-allowed disabled:opacity-40 ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
