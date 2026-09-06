import { Skeleton } from "@/components/ui/Skeleton";

/** Misma anatomía que la cabecera de marca (barra de volver + banner). */
export function BrandHeaderSkeleton() {
  return (
    <div aria-hidden>
      <div className="flex min-h-[52px] items-center justify-between border-b border-line px-page">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-14" />
      </div>
      <div className="grid items-end gap-[clamp(22px,4vw,40px)] border-b border-line bg-subtle px-page pb-[clamp(28px,5vw,40px)] pt-[clamp(52px,9vw,88px)] lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Skeleton className="h-[clamp(42px,11vw,150px)] w-3/4 bg-line" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full bg-line" />
          <Skeleton className="h-4 w-1/2 bg-line" />
        </div>
      </div>
    </div>
  );
}
