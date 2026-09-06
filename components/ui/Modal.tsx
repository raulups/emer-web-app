"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DUR, EASE, EASE_OUT, PANEL_ENTER } from "@/lib/motion";
import { Portal } from "./Portal";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Ancho máximo del panel; por defecto el de un formulario corto. */
  size?: "sm" | "lg";
}

const SIZE_CLASSES: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-md",
  lg: "max-w-2xl",
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Diálogo del handoff: fondo negro al 62% con blur, panel papel con borde
 * de 1px en --fg, cierre en cuadrado negro de 48px pegado a la esquina.
 * Entrada `panelIn` (18px + escala .985) en --dur-base; salida en
 * --dur-fast.
 *
 * Escape cierra, click en el fondo cierra, el scroll de la página se
 * bloquea mientras está abierto, el Tab no se escapa al contenido de detrás
 * y el foco vuelve al botón que lo abrió al cerrar.
 */
export function Modal({ open, onClose, title, children, size = "sm" }: ModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // `onClose` suele llegar como arrow inline, así que cambia de identidad en
  // cada render del padre. Guardarlo en una ref permite que el efecto de
  // abajo dependa solo de `open`: si dependiera de `onClose`, se
  // desmontaría y remontaría a media escritura, devolviendo el foco al
  // disparador y sacando al usuario del campo que estaba rellenando.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    triggerRef.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      // Trampa de foco: sin esto el tabulador sigue recorriendo el header y
      // el catálogo de detrás, que están ocultos tras el fondo pero siguen
      // en el árbol.
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panelRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
      // Devuelve el foco al disparador: sin esto, al cerrar con Escape el
      // foco se pierde en <body> y la navegación por teclado vuelve a
      // empezar desde el principio de la página.
      triggerRef.current?.focus?.();
    };
  }, [open]);

  // Portal a body: el header tiene backdrop-filter y, sin esto, `fixed`
  // quedaría constreñido a sus 54px (ver Portal.tsx).
  return (
    <Portal>
      <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-[clamp(10px,3vw,24px)] sm:items-center">
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: DUR.fast, ease: EASE_OUT } }}
            transition={{ duration: DUR.base, ease: EASE }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/60 backdrop-blur-[6px]"
            aria-hidden
          />
          <motion.div
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            // Foco programable, pero sin `autoFocus`: quien decide dónde
            // entra el foco es el contenido (su primer campo).
            tabIndex={-1}
            initial={{ opacity: 0, y: PANEL_ENTER.y, scale: PANEL_ENTER.scale }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: PANEL_ENTER.y,
              transition: { duration: DUR.fast, ease: EASE_OUT },
            }}
            transition={{ duration: DUR.base, ease: EASE }}
            // `max-h` + scroll interno: en pantallas bajas (móvil apaisado,
            // registro con aviso) el panel no debe crecer más que el
            // viewport; scrollea por dentro.
            className={`relative my-auto flex max-h-[calc(100vh-2*clamp(10px,3vw,24px))] w-full flex-col border border-ink bg-paper ${SIZE_CLASSES[size]}`}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute right-0 top-0 z-[3] flex h-12 w-12 items-center justify-center bg-ink text-[15px] text-fg-inverse transition-colors duration-fast ease-zara hover:bg-fg-hover-2"
            >
              ✕
            </button>
            <div className="shrink-0 border-b border-line py-4 pl-6 pr-16">
              <h2 className="display text-[clamp(19px,5vw,22px)] font-extrabold tracking-heading">
                {title}
              </h2>
            </div>
            <div className="min-h-0 overflow-y-auto px-6 py-6">{children}</div>
          </motion.div>
        </div>
      ) : null}
      </AnimatePresence>
    </Portal>
  );
}
