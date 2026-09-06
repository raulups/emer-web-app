"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { DUR, EASE, EASE_OUT, ENTER_Y } from "@/lib/motion";

/**
 * Transición de contenido entre rutas: el `fadeUp` del handoff (opacidad
 * 0→1, 14px→0) al entrar cada vista, y el contenido saliente se desvanece
 * antes (`mode="wait"`) para no solapar dos páginas.
 *
 * Duraciones asimétricas a propósito: la salida va en --dur-fast para no
 * añadir latencia percibida, y la entrada en --dur-slow.
 *
 * Deliberadamente sin `searchParams` en la key: los cambios de filtro/orden
 * (mismo pathname) NO deben disparar esta transición de página completa —
 * ya tienen su propio overlay que preserva el scroll (ver ProductsExplorer).
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: ENTER_Y }}
        animate={{ opacity: 1, y: 0 }}
        exit={{
          opacity: 0,
          y: -8,
          transition: { duration: DUR.fast, ease: EASE_OUT },
        }}
        transition={{ duration: DUR.slow, ease: EASE }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
