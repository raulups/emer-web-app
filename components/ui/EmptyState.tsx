import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  /** CTA opcional (p.ej. "Limpiar filtros"), como en el vacío del handoff. */
  action?: ReactNode;
}

/** Estado vacío: titular Archivo 800 y, si procede, un bloque negro de acción. */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-page py-[clamp(50px,10vw,90px)] text-center">
      <p className="display text-[clamp(20px,5vw,26px)] font-extrabold tracking-[-0.03em]">
        {title}
      </p>
      {description ? (
        <p className="mono max-w-md text-text-3">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
