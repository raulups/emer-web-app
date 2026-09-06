"use client";

import { useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageContainer>
      <EmptyState
        title="Algo ha fallado"
        description="No se ha podido cargar el contenido. Inténtalo de nuevo."
      />
      <div className="mt-6 flex justify-center">
        {/* `outline` (borde de 1px): el relleno sólido está reservado a los
            dos CTA funcionales del catálogo, no a un reintento de error. */}
        <Button variant="outline" onClick={reset}>
          Reintentar
        </Button>
      </div>
    </PageContainer>
  );
}
