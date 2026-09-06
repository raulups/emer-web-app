import type { ReactNode } from "react";

/**
 * Padding horizontal estándar de página (`--px-page`, fluido). El handoff
 * es de ancho completo —sin max-width—, así que aquí solo hay padding.
 *
 * Vive aquí y no en el <main> del layout a propósito: así una ruta puede
 * sacar un bloque a sangre completa (hero, bento, rejilla continua)
 * simplemente dejándolo fuera de este contenedor.
 */
export function PageContainer({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`px-page ${className}`}>{children}</div>;
}
