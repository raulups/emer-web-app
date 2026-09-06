import { PageContainer } from "@/components/layout/PageContainer";
import { BrandGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <PageContainer>
      <div className="mb-12 border-b border-line pb-8">
        <Skeleton className="h-10 w-48 sm:h-14" />
      </div>
      <Skeleton className="mb-10 h-4 w-40" />
      <BrandGridSkeleton />
    </PageContainer>
  );
}
