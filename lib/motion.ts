/**
 * Tokens de movimiento del sistema de diseño, en el formato que espera
 * Framer Motion (segundos y arrays de bezier), espejo de las variables CSS
 * `--dur-*` / `--ease*` de app/globals.css.
 *
 * Reglas (handoff "Marketplace Moda"):
 * - Una sola curva para todo, `cubic-bezier(.22,.61,.36,1)`; nunca spring.
 * - Escala máxima en hover: 1.05 (imagen de marca), 1.04 (producto).
 * - Entradas: 14px (vistas, botones) / 18px + scale .985 (paneles).
 */

/** --ease: la curva del handoff, para entradas, fades y zooms. */
export const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

/** --ease-out: acelera al final, para salidas. */
export const EASE_OUT: [number, number, number, number] = [0.4, 0, 1, 1];

/** Duraciones en segundos (Framer) — equivalen a --dur-fast/base/slow/zoom. */
export const DUR = {
  fast: 0.2,
  base: 0.4,
  slow: 0.6,
  zoom: 1.1,
} as const;

/** Desplazamiento vertical de entrada de vistas y botones (fadeUp). */
export const ENTER_Y = 14;

/** Entrada de paneles (panelIn del handoff): 18px + escala .985. */
export const PANEL_ENTER = { y: 18, scale: 0.985 } as const;

/** Escalas de zoom al hover. */
export const HOVER_SCALE = { brand: 1.05, product: 1.04 } as const;

/** Retardo entre elementos del grid, con techo para no encadenar esperas largas. */
export function staggerDelay(index: number, step = 0.03, max = 0.36): number {
  return Math.min(index * step, max);
}
