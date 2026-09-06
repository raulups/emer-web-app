"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SORT_OPTIONS, type SortOption } from "@/lib/types/filters";
import { DUR, EASE, EASE_OUT } from "@/lib/motion";

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

/** Dropdown de orden, discreto, junto al botón de filtro — no un drawer. */
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
        className="flex h-10 items-center gap-2 border border-line px-3 text-ui uppercase tracking-ui text-ink transition-colors duration-fast ease-zara hover:border-ink"
      >
        <span className="hidden sm:inline">{currentLabel}</span>
        <span className="sm:hidden">Ordenar</span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: DUR.fast, ease: EASE }}
          width="9"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          aria-hidden
        >
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" />
        </motion.svg>
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
            className="absolute right-0 top-full z-20 mt-2 w-64 border border-ink bg-paper py-1"
          >
            {SORT_OPTIONS.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`block w-full px-4 py-2.5 text-left text-ui uppercase tracking-ui transition-colors duration-fast ease-zara hover:bg-subtle ${
                    option.value === value ? "text-ink" : "text-muted-text"
                  }`}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
