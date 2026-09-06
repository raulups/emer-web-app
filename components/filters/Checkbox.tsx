/**
 * Marca del handoff para filas de opción: cuadrado de 14px con borde en
 * --fg, que se rellena de negro con un punto de 5px en papel al activarse.
 * Es puramente visual — el estado y la accesibilidad los aporta el control
 * que lo envuelve (un `<button aria-pressed>` o un `<input>` sr-only).
 */
export function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={`inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center border border-ink transition-colors duration-fast ease-zara ${
        checked ? "bg-ink" : "bg-transparent"
      }`}
    >
      <span
        className={`h-[5px] w-[5px] bg-paper transition-opacity duration-fast ease-zara ${
          checked ? "opacity-100" : "opacity-0"
        }`}
      />
    </span>
  );
}
