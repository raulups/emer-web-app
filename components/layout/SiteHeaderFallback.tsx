/**
 * Mismas dimensiones que SiteHeader (--header-h: 54px en desktop, 94px en
 * móvil con la fila de género), para que el <Suspense> que lo envuelve en el
 * layout no salte — SiteHeader es client (usa el gender de la URL) y
 * necesita ese boundary.
 */
export function SiteHeaderFallback() {
  return (
    <div
      className="fixed inset-x-0 top-0 z-[60] h-header border-b border-line bg-paper/90 backdrop-blur-[10px]"
      aria-hidden
    />
  );
}
