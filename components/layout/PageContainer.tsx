import type { ReactNode } from "react";

/**
 * Contenedor con el ancho y padding estándar de página.
 *
 * El padding vive aquí y no en el <main> del layout a propósito: así una
 * ruta puede sacar un bloque a sangre completa de viewport (el hero de
 * /brands/[brandId]) simplemente dejándolo fuera de este contenedor, sin
 * pelearse con márgenes negativos.
 */
export function PageContainer({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-14 ${className}`}>
      {children}
    </div>
  );
}
