/** Mismas dimensiones que el hero de marca (60vh a sangre) para no saltar. */
export function BrandHeaderSkeleton() {
  return (
    <div
      className="bleed-full relative h-[60vh] min-h-[380px] animate-pulse bg-subtle"
      aria-hidden
    >
      <div className="flex h-full items-end">
        <div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-8 sm:pb-14">
          <div className="h-12 w-2/3 max-w-lg bg-line sm:h-16" />
          <div className="mt-5 h-4 w-32 bg-line" />
        </div>
      </div>
    </div>
  );
}
