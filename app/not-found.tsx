import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <EmptyState
      title="No encontrado"
      description="El contenido que buscas no existe o ha sido eliminado"
      action={
        <Link
          href="/"
          className="mono inline-flex min-h-cta items-center gap-3 bg-ink px-6 py-3 text-fg-inverse transition-colors duration-fast ease-zara hover:bg-fg-hover"
        >
          Volver al directorio <span aria-hidden>→</span>
        </Link>
      }
    />
  );
}
