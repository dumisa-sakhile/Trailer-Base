import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MediaCard from "./MediaCard";
import { Skeleton } from "@/components/ui/skeleton";
import useLastViewedStore from "@/stores/viewStore";

export interface MediaProps {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path: string;
  vote_average: number;
}

interface BecauseYouWatchedProps {
  recommendations: MediaProps[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  mediaType: 'movie' | 'tv'; // Add this prop
}

const MediaCardSkeleton: React.FC = () => (
  <div className="relative w-[180px] h-[270px] max-sm:w-[140px] max-sm:h-[210px]">
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg bg-neutral-800 border-0 p-0">
      <div className="relative w-full h-full">
        <Skeleton className="w-full h-full rounded-2xl bg-neutral-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-90 flex flex-col justify-end p-4 max-sm:p-2 rounded-2xl">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 bg-neutral-600 rounded" />
            <Skeleton className="h-3 w-12 bg-neutral-600 rounded max-sm:h-2" />
          </div>
          <Skeleton className="h-3 w-16 bg-neutral-600 rounded mt-1 max-sm:h-2" />
          <Skeleton className="h-4 w-24 bg-neutral-600 rounded mt-2 max-sm:h-3" />
          <Skeleton className="h-4 w-20 bg-neutral-600 rounded mt-1 max-sm:h-3" />
        </div>
      </div>
    </div>
    <div className="absolute top-3 left-3 p-2 bg-neutral-700 rounded-full shadow-md max-sm:p-1.5 max-sm:top-2 max-sm:left-2">
      <Skeleton className="w-5 h-5 bg-neutral-600 rounded-full" />
    </div>
  </div>
);

const BecauseYouWatched: React.FC<BecauseYouWatchedProps> = ({
  recommendations,
  isLoading,
  isError,
  error,
  mediaType, // Use the passed mediaType
}) => {
  const { lastViewedMovie, lastViewedTV } = useLastViewedStore();
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Determine which content was last viewed based on the mediaType
  const lastViewed = mediaType === 'movie' ? lastViewedMovie : lastViewedTV;
  const data = recommendations || [];

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || data.length === 0) return;
    
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 8);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    };
    
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [data]);

  const scrollByAmount = (direction: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.8, 300);
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  // Don't show anything if nothing was watched yet or no data/loading/error
  if (!lastViewed || (!isLoading && data.length === 0 && !isError)) {
    return null;
  }

  return (
    <motion.section
      className="w-full flex flex-col gap-4 px-4 sm:px-6 lg:px-8 py-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <AnimatePresence>
        {!isLoading && (
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-lg max-sm:text-base lg:text-xl text-neutral-100 font-semibold tracking-tight">
              Because you watched {lastViewed?.name}
            </h2>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-2" /> {/* Spacer */}

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex gap-3 items-stretch justify-start overflow-x-auto no-scrollbar pl-4 sm:pl-6 lg:pl-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0">
                  <MediaCardSkeleton />
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {isError ? (
              <motion.div
                className="w-full text-center text-red-400 font-medium py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Error: {error?.message ?? "Failed to load recommendations"}
              </motion.div>
            ) : data.length > 0 ? (
              <div className="relative">
                {/* Scroll buttons */}
                <button
                  type="button"
                  onClick={() => scrollByAmount("left")}
                  aria-label="Scroll left"
                  aria-disabled={!canScrollLeft}
                  className={`absolute left-2 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center w-11 h-11 rounded-full bg-neutral-900/95 text-white shadow-lg transition-colors duration-200 focus:outline-none ring-1 ring-white/6 ${
                    canScrollLeft ? "hover:bg-neutral-800 cursor-pointer" : "opacity-50 cursor-default"
                  }`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6"></path>
                  </svg>
                </button>
                
                <button
                  type="button"
                  onClick={() => scrollByAmount("right")}
                  aria-label="Scroll right"
                  aria-disabled={!canScrollRight}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center w-11 h-11 rounded-full bg-neutral-900/95 text-white shadow-lg transition-colors duration-200 focus:outline-none ring-1 ring-white/6 ${
                    canScrollRight ? "hover:bg-neutral-800 cursor-pointer" : "opacity-50 cursor-default"
                  }`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 6l6 6-6 6"></path>
                  </svg>
                </button>

                {/* Content */}
                <div ref={scrollerRef} className="w-full overflow-x-auto no-scrollbar">
                  <motion.div
                    className="flex gap-3 items-stretch justify-start pl-4 sm:pl-6 lg:pl-8"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.08,
                          delayChildren: 0.1
                        }
                      },
                    }}
                  >
                    {data.map((item: MediaProps, index) => (
                      <motion.div
                        key={item.id}
                        variants={cardVariants}
                        transition={{ delay: index * 0.03 }}
                        className="flex-shrink-0"
                      >
                        <MediaCard
                          id={item.id}
                          title={item.title || item.name || "Untitled"}
                          release_date={item.release_date || item.first_air_date || ""}
                          poster_path={item.poster_path}
                          vote_average={item.vote_average}
                          type={mediaType} // Use the passed mediaType
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>
            ) : (
              <motion.div
                className="w-full text-center text-neutral-400 py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                No recommendations available.
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default BecauseYouWatched;