"use client";

import { useEffect, useState } from "react";

/** Devuelve `value` con un retardo, útil para inputs de búsqueda que escriben en la URL. */
export function useDebouncedValue<T>(value: T, delayMs = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}
