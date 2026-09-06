interface ToggleFilterProps {
  label: string;
  active: boolean;
  onToggle: () => void;
}

/** Toggle simple estilo pill cuadrada, para "disponible" / "en oferta". */
export function ToggleFilter({ label, active, onToggle }: ToggleFilterProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={`whitespace-nowrap border px-3 py-2.5 text-ui uppercase tracking-ui transition-colors duration-fast ease-zara ${
        active
          ? "border-ink bg-ink text-fg-inverse"
          : "border-line text-ink hover:border-ink"
      }`}
    >
      {label}
    </button>
  );
}
