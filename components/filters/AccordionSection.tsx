"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DUR, EASE } from "@/lib/motion";
import { padCount } from "@/lib/utils/format";

interface AccordionSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  /** Numeración editorial ("01", "02"...), tono de sumario. */
  index?: number;
  /** Se muestra junto al título (p.ej. "02" cuando hay valores elegidos). */
  badge?: ReactNode;
}

/**
 * Grupo del sidebar de filtros: etiqueta mono en gris con el número, y
 * contenido expandible con animación de altura automática.
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
        className="mono flex min-h-hit w-full items-center justify-between gap-3 py-3.5 text-left tracking-mono-wide text-text-3 transition-colors duration-fast ease-zara hover:text-ink"
      >
        <span className="flex items-baseline gap-3">
          {index !== undefined ? <span>{padCount(index)}</span> : null}
          <span className="flex items-center gap-2 text-ink">
            {title}
            {badge ? <span className="text-text-3">/ {badge}</span> : null}
          </span>
        </span>
        <span aria-hidden className="text-ink">
          {open ? "—" : "+"}
        </span>
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
