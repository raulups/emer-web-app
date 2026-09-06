import { GRID_DENSITY_CLASSES, type GridDensity } from "@/lib/types/grid";

interface SkeletonProps {
  className?: string;
}

/** Bloque de carga: pulso sobre --skeleton (gris muy claro), sin radio. */
export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse bg-subtle ${className}`} />;
}

export function ProductGridSkeleton({
  count = 6,
  density = "standard",
}: {
  count?: number;
  density?: GridDensity;
}) {
  return (
    <div className={`grid gap-x-4 gap-y-10 ${GRID_DENSITY_CLASSES[density]}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <Skeleton className="aspect-[3/4] w-full" />
          <Skeleton className="mt-4 h-4 w-3/4" />
          <Skeleton className="mt-2 h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}

export function BrandGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <Skeleton className="aspect-[4/5] w-full" />
          <Skeleton className="mt-4 h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}
