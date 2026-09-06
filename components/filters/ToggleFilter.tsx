interface ToggleFilterProps {
  label: string;
  active: boolean;
  onToggle: () => void;
}

/**
 * Toggle con la anatomía de las pastillas del handoff: borde de 1px,
 * 44px de alto, y al activarse se invierte y muestra el punto ●.
 */
export function ToggleFilter({ label, active, onToggle }: ToggleFilterProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={`mono flex min-h-hit w-full items-center justify-between gap-2.5 border px-3 text-left transition-colors duration-fast ease-zara ${
        active
          ? "border-ink bg-ink text-fg-inverse"
          : "border-line text-ink hover:border-ink"
      }`}
    >
      <span>{label}</span>
      <span aria-hidden>{active ? "●" : ""}</span>
    </button>
  );
}
