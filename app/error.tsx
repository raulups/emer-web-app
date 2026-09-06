"use client";

import { useEffect } from "react";
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
    <EmptyState
      title="Algo ha fallado"
      description="No se ha podido cargar el contenido"
      action={
        <Button variant="solid" onClick={reset}>
          Reintentar <span aria-hidden>→</span>
        </Button>
      }
    />
  );
}
