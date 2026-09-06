"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SORT_OPTIONS, type SortOption } from "@/lib/types/filters";
import { DUR, EASE, EASE_OUT } from "@/lib/motion";

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

/**
 * Orden. Las pastillas del handoff van dentro del sidebar; aquí el orden
 * vive en la barra de resultados (siempre visible, también en móvil), como
 * "ORDEN: X" que despliega la lista. La opción activa se invierte y lleva
 * el punto ●, igual que las pastillas del prototipo.
 */
export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const currentLabel = SORT_OPTIONS.find((o) => o.value === value)?.label ?? "";

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="mono flex min-h-hit shrink-0 items-center gap-2.5 whitespace-nowrap border border-line px-3 text-ink transition-colors duration-fast ease-zara hover:border-ink"
      >
        <span className="text-text-3">Orden<span className="hidden sm:inline">:</span></span>
        <span className="hidden sm:inline">{currentLabel}</span>
        <span aria-hidden>{open ? "—" : "+"}</span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: -4,
              transition: { duration: DUR.fast, ease: EASE_OUT },
            }}
            transition={{ duration: DUR.fast, ease: EASE }}
            className="absolute right-0 top-full z-20 mt-2 flex w-64 flex-col gap-1.5 border border-ink bg-paper p-1.5"
          >
            {SORT_OPTIONS.map((option) => {
              const active = option.value === value;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={`mono flex min-h-hit w-full items-center justify-between gap-2.5 border px-3 text-left transition-colors duration-fast ease-zara ${
                      active
                        ? "border-ink bg-ink text-fg-inverse"
                        : "border-line text-ink hover:border-ink"
                    }`}
                  >
                    <span>{option.label}</span>
                    <span aria-hidden>{active ? "●" : ""}</span>
                  </button>
                </li>
              );
            })}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
