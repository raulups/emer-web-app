interface EmptyStateProps {
  title: string;
  description?: string;
}

/** Estado vacío: solo tipografía, sin iconografía ni relleno decorativo. */
export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center border border-line px-6 py-24 text-center">
      <p className="text-ui uppercase tracking-ui text-ink">{title}</p>
      {description ? (
        <p className="mt-3 max-w-sm text-ui text-muted-text">{description}</p>
      ) : null}
    </div>
  );
}
