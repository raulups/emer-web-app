import { BrandHeaderSkeleton } from "@/components/brands/BrandHeaderSkeleton";
import { ProductsExplorerSkeleton } from "@/components/products/ProductsExplorerSkeleton";

export default function Loading() {
  return (
    <div>
      <BrandHeaderSkeleton />
      <ProductsExplorerSkeleton />
    </div>
  );
}
