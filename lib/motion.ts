/**
 * Tokens de movimiento del sistema de diseño, en el formato que espera
 * Framer Motion (segundos y arrays de bezier), espejo de las variables CSS
 * `--dur-*` / `--ease*` de app/globals.css.
 *
 * Reglas del sistema (ver README, "Sistema de diseño"):
 * - Nunca spring, nunca rebote, nunca overshoot: solo estas dos curvas.
 * - Desplazamiento máximo de entrada: 16px. Escala máxima en hover: 1.02.
 */

/** --ease: curva neutra, para entradas y fades. */
export const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

/** --ease-out: acelera al final, para salidas. */
export const EASE_OUT: [number, number, number, number] = [0.4, 0, 1, 1];

/** Duraciones en segundos (Framer) — equivalen a --dur-fast/base/slow. */
export const DUR = {
  fast: 0.2,
  base: 0.4,
  slow: 0.6,
} as const;

/** Desplazamiento vertical de entrada estándar (dentro del máximo de 16px). */
export const ENTER_Y = 12;

/** Retardo entre elementos del grid, con techo para no encadenar esperas largas. */
export function staggerDelay(index: number, step = 0.03, max = 0.36): number {
  return Math.min(index * step, max);
}
