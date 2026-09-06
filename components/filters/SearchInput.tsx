"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

/** Búsqueda por texto sobre `name`, con debounce antes de escribir en la URL. */
export function SearchInput({ value, onChange }: SearchInputProps) {
  const [draft, setDraft] = useState(value);
  const debounced = useDebouncedValue(draft, 350);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (debounced !== value) onChange(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <Input
      type="search"
      placeholder="Buscar por nombre…"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      aria-label="Buscar productos por nombre"
    />
  );
}
