"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DUR, EASE } from "@/lib/motion";

interface AccordionSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  /** Numeración editorial ("01", "02"...), tono de sumario de revista. */
  index?: number;
  /** Se muestra junto al título (p.ej. "2" cuando hay valores elegidos). */
  badge?: ReactNode;
}

/**
 * Sección expandible/colapsable del drawer de filtros, con animación de
 * altura automática (AnimatePresence + `height: "auto"`).
 */
export function AccordionSection({
  title,
  children,
  defaultOpen = false,
  index,
  badge,
}: AccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-line">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 py-4 text-left"
      >
        <span className="flex items-baseline gap-3 text-ui uppercase tracking-ui text-ink">
          {index !== undefined ? (
            <span className="text-muted-text">
              {String(index).padStart(2, "0")}
            </span>
          ) : null}
          <span className="flex items-center gap-2">
            {title}
            {badge}
          </span>
        </span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: DUR.fast, ease: EASE }}
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          aria-hidden
        >
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" />
        </motion.svg>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: DUR.base, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="pb-5">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
