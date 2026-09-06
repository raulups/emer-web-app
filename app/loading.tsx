import { BrandGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <div className="flex flex-col border-b border-line md:min-h-[calc(100vh-var(--header-h))]">
        <div className="grid gap-[clamp(18px,4vw,40px)] px-page pb-[clamp(22px,4vw,34px)] pt-section lg:grid-cols-[minmax(0,52fr)_minmax(0,48fr)]">
          <div className="space-y-5">
            <Skeleton className="hidden h-4 w-64 md:block" />
            <Skeleton className="h-[clamp(88px,26vw,292px)] w-3/4" />
          </div>
          <div className="hidden space-y-4 lg:block">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <div className="flex flex-1 items-center gap-2 px-page py-4">
          <Skeleton className="h-[clamp(260px,46vh,440px)] w-[clamp(300px,64vw,720px)] shrink-0" />
          <Skeleton className="h-[clamp(260px,46vh,440px)] w-[clamp(300px,64vw,720px)] shrink-0" />
        </div>
      </div>
      <div className="bg-ink px-page pb-8 pt-[clamp(34px,7vw,76px)] md:pb-12">
        <Skeleton className="mx-auto h-[clamp(44px,12vw,184px)] w-2/3 bg-paper/10" />
      </div>
      <BrandGridSkeleton />
    </div>
  );
}
