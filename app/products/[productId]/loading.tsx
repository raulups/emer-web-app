import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Misma rejilla que el detalle real (65/35 en desktop, galería en 3/4) para
 * que el contenido no salte al llegar los datos.
 */
export default function Loading() {
  return (
    <PageContainer>
      <Skeleton className="mb-8 h-4 w-48" />
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[65fr_35fr] lg:gap-16">
        <Skeleton className="aspect-[3/4] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </div>
    </PageContainer>
  );
}
