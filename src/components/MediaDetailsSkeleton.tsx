import React from "react";

/**
 * Responsive poster placeholder that scales across breakpoints
 */
const PosterSkeleton: React.FC = () => (
  <div
    className="flex-shrink-0 w-full max-w-[220px] h-[320px]
               sm:max-w-[240px] sm:h-[360px]
               md:max-w-[320px] md:h-[480px]
               bg-neutral-800 rounded-xl shadow-2xl animate-pulse mx-auto md:mx-0"
    aria-hidden="true"
  />
);

/**
 * Generic pill / badge placeholder
 */
const Pill: React.FC<{ w?: string }> = ({ w = "w-20" }) => (
  <div className={`h-8 ${w} bg-neutral-800 rounded-full`} />
);

/**
 * Small line placeholder
 */
const Line: React.FC<{ w?: string; h?: string }> = ({ w = "w-full", h = "h-4" }) => (
  <div className={`${h} ${w} bg-neutral-800 rounded`} />
);

/**
 * Cast carousel skeleton
 */
const CastSkeleton: React.FC = () => (
  <div className="flex gap-4 overflow-x-auto py-2">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="flex-shrink-0 w-20">
        <div className="w-20 h-20 bg-neutral-800 rounded-full mb-2 animate-pulse" />
        <div className="h-3 w-16 bg-neutral-800 rounded animate-pulse" />
      </div>
    ))}
  </div>
);

/**
 * Main skeleton that resembles a movie / TV details page
 */
const MinimalMediaSkeleton: React.FC<{ mediaType?: "movie" | "tv" }> = ({ mediaType = "movie" }) => {
  return (
    <div className="w-full min-h-screen bg-black text-white p-4 sm:p-6 lg:p-12 flex flex-col gap-8">
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Poster */}
        <div className="md:flex-shrink-0 md:pt-6">
          <PosterSkeleton />
        </div>

        {/* Details */}
        <div className="flex-1 flex flex-col gap-4 md:pt-6">
          {/* Title + tagline */}
          <header className="space-y-3">
            <div className="mx-auto md:mx-0">
              <Line w="w-3/4 md:w-full" h="h-12" />
            </div>
            <div className="mx-auto md:mx-0">
              <Line w="w-1/2 md:w-2/3" h="h-5" />
            </div>
          </header>

          {/* Metadata row: release, rating, runtime, watchlist */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex gap-3 items-center">
              <Pill w="w-36" />
              <Pill w="w-28" />
            </div>
            {mediaType === "movie" && <Pill w="w-32" />}
            <Pill w="w-28" />
          </div>

          {/* Genres / tags */}
          <div className="flex flex-wrap gap-2 mt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 px-3 bg-neutral-800 rounded-full animate-pulse" />
            ))}
          </div>

          {/* Overview */}
          <section className="mt-4 max-w-3xl">
            <div className="mb-3">
              <Line w="w-36" />
            </div>
            <div className="space-y-2">
              <Line />
              <Line />
              <Line w="w-11/12" />
              <Line w="w-3/4" />
            </div>
          </section>

          {/* Actions (play/watch trailer/bookmark) */}
          <div className="flex gap-3 mt-4">
            <div className="h-11 w-40 bg-blue-700 rounded-lg animate-pulse" />
            <div className="h-11 w-32 bg-neutral-800 rounded-lg animate-pulse" />
            <div className="h-11 w-11 bg-neutral-800 rounded-full animate-pulse" />
          </div>

          {/* Cast */}
          <section className="mt-6">
            <div className="mb-3">
              <Line w="w-32" h="h-6" />
            </div>
            <CastSkeleton />
          </section>

          {/* Additional details (creators / companies) */}
          <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="mb-3"><Line w="w-36" /></div>
              <div className="flex flex-wrap gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-10 w-28 bg-neutral-800 rounded animate-pulse" />
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3"><Line w="w-28" /></div>
              <div className="flex flex-wrap gap-3 items-center">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-8 w-20 bg-neutral-800 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Full-width content blocks */}
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
        <div>
          <Line w="w-48" />
          <div className="mt-3 space-y-2">
            <Line />
            <Line />
            <Line w="w-3/4" />
          </div>
        </div>

        <div>
          <Line w="w-40" />
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 bg-neutral-800 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      {/* Fixed mobile CTA */}
      <div className="fixed bottom-4 left-4 right-4 sm:hidden z-40">
        <div className="h-14 bg-blue-700 rounded-lg shadow-2xl flex items-center justify-center animate-pulse">
          <div className="h-5 w-1/2 bg-blue-500 rounded" />
        </div>
      </div>

      {/* Spacer for bottom-safe-area on mobile */}
      <div className="h-6 sm:hidden" />
    </div>
  );
};

export default MinimalMediaSkeleton;
