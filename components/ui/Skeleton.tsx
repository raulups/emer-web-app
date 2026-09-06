import type { GridDensity } from "@/lib/types/grid";
import { GRID_DENSITY_CLASSES } from "@/lib/types/grid";

interface SkeletonProps {
  className?: string;
}

/** Bloque de carga: pulso sobre --muted-bg (gris cálido muy claro), sin radio. */
export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse bg-subtle ${className}`} />;
}

/** Misma rejilla continua (sin gap, bordes de 1px) que ProductGrid. */
export function ProductGridSkeleton({
  count = 6,
  density = "standard",
}: {
  count?: number;
  density?: GridDensity;
}) {
  return (
    <div className={`grid border-l border-line ${GRID_DENSITY_CLASSES[density]}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border-b border-r border-line">
          <Skeleton className="aspect-[3/4] w-full" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Misma anatomía que el bento de marcas: una fila completa + una partida. */
export function BrandGridSkeleton() {
  return (
    <div>
      <Skeleton className="h-[56vh] min-h-[340px] w-full border-b border-line md:h-[74vh]" />
      <div className="grid border-b border-line md:grid-cols-[68fr_32fr]">
        <Skeleton className="h-[64vh] min-h-[380px] w-full border-b border-line md:h-[86vh] md:border-b-0 md:border-r" />
        <Skeleton className="h-[56vh] min-h-[340px] w-full md:h-[86vh]" />
      </div>
    </div>
  );
}
