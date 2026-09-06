import { BrandGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <div className="flex min-h-[calc(100vh-var(--header-h))] flex-col border-b border-line">
        <div className="grid gap-[clamp(18px,4vw,40px)] px-page pb-[clamp(22px,4vw,34px)] pt-section lg:grid-cols-[minmax(0,52fr)_minmax(0,48fr)]">
          <div className="space-y-5">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-[clamp(88px,26vw,292px)] w-3/4" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <div className="flex flex-1 items-center gap-10 px-page">
          <Skeleton className="h-[clamp(52px,13vw,128px)] w-[40vw]" />
          <Skeleton className="h-[clamp(52px,13vw,128px)] w-[30vw]" />
        </div>
      </div>
      <Skeleton className="h-[100vh] min-h-[560px] w-full" />
      <BrandGridSkeleton />
    </div>
  );
}
