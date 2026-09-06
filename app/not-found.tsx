import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <PageContainer>
      <EmptyState
        title="No encontrado"
        description="El contenido que buscas no existe o ha sido eliminado."
      />
      <div className="mt-6 text-center">
        <Link
          href="/"
          className="link-underline text-ui uppercase tracking-ui text-ink"
        >
          Volver al inicio
        </Link>
      </div>
    </PageContainer>
  );
}
