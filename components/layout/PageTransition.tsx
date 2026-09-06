"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { DUR, EASE, EASE_OUT } from "@/lib/motion";

/**
 * Transición de contenido entre rutas: el contenido saliente se desvanece
 * antes de que entre el nuevo (`mode="wait"`), evitando parpadeos o saltos
 * de layout al navegar.
 *
 * Duraciones asimétricas a propósito: la salida va en --dur-fast para no
 * añadir latencia percibida, y la entrada en --dur-slow, que es el token
 * que el sistema reserva para transiciones entre pantallas. El
 * desplazamiento se queda en 8px, dentro del máximo de 16px.
 *
 * Se monta una sola vez desde app/layout.tsx (no desde template.tsx: ese
 * mecanismo remonta el árbol en cada navegación y por tanto no puede
 * solapar salida/entrada).
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
        initial={{ opacity: 0, y: 8 }}
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
