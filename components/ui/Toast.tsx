"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DUR, EASE, EASE_OUT, ENTER_Y } from "@/lib/motion";

interface ToastProps {
  message: string | null;
  onDismiss: () => void;
  /** Milisegundos hasta el auto-cierre. */
  duration?: number;
}

/**
 * Confirmación breve, abajo a la izquierda: bloque negro con texto mono, la
 * misma inversión que usan los CTAs sólidos del sistema.
 *
 * `aria-live="polite"` para que un lector de pantalla anuncie el resultado
 * de la acción, que si no sería un cambio puramente visual.
 */
export function Toast({ message, onDismiss, duration = 4000 }: ToastProps) {
  // Ref para que el temporizador no dependa de la identidad de `onDismiss`:
  // llega como arrow inline, así que un render del padre lo reiniciaría y el
  // aviso podría no cerrarse nunca.
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(() => onDismissRef.current(), duration);
    return () => clearTimeout(timeout);
  }, [message, duration]);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 left-page z-[55]"
    >
      <AnimatePresence>
        {message ? (
          <motion.div
            initial={{ opacity: 0, y: ENTER_Y }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: ENTER_Y,
              transition: { duration: DUR.fast, ease: EASE_OUT },
            }}
            transition={{ duration: DUR.base, ease: EASE }}
            className="mono pointer-events-auto flex min-h-cta items-center gap-5 bg-ink px-5 py-3 text-fg-inverse"
          >
            <span>{message}</span>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Cerrar aviso"
              className="link-quiet text-[15px] leading-none"
            >
              ✕
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
