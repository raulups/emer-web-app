/**
 * Mismas dimensiones que SiteHeader (--header-h: fila de género 40px + fila
 * principal 64px), para que el <Suspense> que lo envuelve en el layout no
 * salte — SiteHeader es client (usa el gender de la URL) y necesita ese
 * boundary.
 */
export function SiteHeaderFallback() {
  return (
    <div
      className="sticky top-0 z-20 h-header border-b border-line bg-paper"
      aria-hidden
    >
      <div className="h-10 border-b border-line" />
      <div className="h-16" />
    </div>
  );
}
