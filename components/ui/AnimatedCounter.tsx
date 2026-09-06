"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import { DUR, EASE } from "@/lib/motion";
import { padCount } from "@/lib/utils/format";

interface AnimatedCounterProps {
  value: number;
  /** A dos dígitos ("04"), el formato de los contadores del handoff. */
  pad?: boolean;
}

/** Número que hace un conteo animado hacia el nuevo valor en vez de saltar. */
export function AnimatedCounter({ value, pad = false }: AnimatedCounterProps) {
  const [display, setDisplay] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    const controls = animate(previousValue.current, value, {
      duration: DUR.base,
      ease: EASE,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    previousValue.current = value;
    return () => controls.stop();
  }, [value]);

  return <span>{pad ? padCount(display) : display}</span>;
}
