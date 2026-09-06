import { Skeleton } from "@/components/ui/Skeleton";

/** Misma rejilla que el detalle real (dos columnas en desktop). */
export default function Loading() {
  return (
    <div>
      <div className="flex min-h-[52px] items-center border-b border-line px-page">
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="grid border-b border-line lg:grid-cols-2">
        <Skeleton className="aspect-[3/4] w-full lg:border-r lg:border-line" />
        <div className="space-y-5 px-[clamp(18px,4vw,36px)] pt-[clamp(30px,5vw,44px)]">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-11 w-2/3" />
          <Skeleton className="h-14 w-full" />
        </div>
      </div>
    </div>
  );
}
