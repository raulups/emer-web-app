"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Monta los hijos directamente en `document.body`.
 *
 * Necesario para cualquier overlay `position: fixed` que se declare dentro
 * del header: su `backdrop-filter: blur()` convierte al header en el bloque
 * contenedor de todos sus descendientes fixed, así que `inset: 0` pasaba a
 * significar "los 54px del header" y el modal de acceso y el buscador
 * salían aplastados dentro de la barra. Fuera del header (en body) `fixed`
 * vuelve a referirse al viewport.
 *
 * Se renderiza `null` hasta el primer efecto: en SSR no existe `document`,
 * y montar en el primer render del cliente rompería la hidratación.
 */
export function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return createPortal(children, document.body);
}
