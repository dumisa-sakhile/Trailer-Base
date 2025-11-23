import React, { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import MediaCard from "./MediaCard";
// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
// Define interfaces for Media properties and MediaList component props
interface MediaProps {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path: string;
  vote_average: number;
}
interface MediaListProps {
  mediaType: "movie" | "tv";
  title: string;
  data: { results: MediaProps[] } | undefined;
  isLoading: boolean;
  isError: boolean;
  error: { message?: string } | null;
  list: "upcoming" | "top_rated" | "popular";
}
// Define card dimensions for the skeleton to match MediaCard's actual sizes
const DEFAULT_CARD_WIDTH = 180;
const SM_CARD_WIDTH = 140; // match mobile card size (was 120)
const GAP = 16;
// Custom hook to get window dimensions for responsiveness in skeletons
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return windowSize;
};
/**
 * MediaCardSkeleton Component
 * Renders a skeleton placeholder for a single media card.
 */
const MediaCardSkeleton: React.FC = () => (
  <div className="relative w-[180px] h-[270px] max-sm:w-[140px] max-sm:h-[210px]">
    <Card className="w-full h-full rounded-2xl overflow-hidden shadow-lg bg-neutral-800 border-0 p-0">
      <CardContent className="p-0 w-full h-full">
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
      </CardContent>
    </Card>
    <div className="absolute top-3 left-3 p-2 bg-neutral-700 rounded-full shadow-md max-sm:p-1.5 max-sm:top-2 max-sm:left-2">
      <Skeleton className="w-5 h-5 bg-neutral-600 rounded-full" />
    </div>
  </div>
);
/**
 * MediaListSkeleton Component
 * Horizontal, scrollable skeleton with left/right buttons
 */
const MediaListSkeleton: React.FC = () => {
  const { width: windowWidth } = useWindowSize();
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const currentCardWidth = windowWidth < 640 ? SM_CARD_WIDTH : DEFAULT_CARD_WIDTH;
  const horizontalPadding = 32 * 2;
  const effectiveWidth = Math.max(0, windowWidth - horizontalPadding);
  const cardsPerView = Math.max(1, Math.floor(effectiveWidth / (currentCardWidth + GAP)));
  const numberOfSkeletons = Math.max(cardsPerView * 2, 6);
  return (
    <div className="relative">
      <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20">
        <Skeleton className="w-10 h-10 rounded-full bg-neutral-700" />
      </div>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20">
        <Skeleton className="w-10 h-10 rounded-full bg-neutral-700" />
      </div>
      <div ref={scrollerRef} className="w-full overflow-x-auto no-scrollbar">
        <div className="flex gap-2 lg:gap-3 items-stretch py-2 justify-start pl-4 sm:pl-6 lg:pl-8">
          {Array.from({ length: numberOfSkeletons }).map((_, i) => (
            <div key={i} className="flex-shrink-0">
              <MediaCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
/**
 * GridSkeleton for mobile 2-column layout
 */
const GridSkeleton: React.FC = () => {
  const cols = 2;
  const rows = 3;
  const numberOfSkeletons = cols * rows;
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-2 justify-items-center">
        {Array.from({ length: numberOfSkeletons }).map((_, i) => (
          <div key={i} className="w-full flex-shrink-0">
            <MediaCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
};
/**
 * MediaList Component
 * Displays a list of media items with smooth animations and proper skeleton loading
 */
const MediaList: React.FC<MediaListProps> = ({
  mediaType,
  title,
  data,
  isLoading,
  isError,
  error,
  list,
}) => {
  // Smooth animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        // removed `ease` to satisfy framer-motion TS types
      },
    },
  };
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
  };
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth < 640;
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
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
  }, [data, isLoading]);
  const scrollByAmount = (direction: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.8, 300);
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };
  return (
    <motion.section
      className="w-full flex flex-col gap-4 px-4 sm:px-6 lg:px-8 py-4"
      initial="initial"
      animate="animate"
      variants={pageVariants}
    >
      {/* Header row: Title + View All */}
      <AnimatePresence>
        {!isLoading && (
          <motion.div
            className="w-full flex items-center justify-between"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-lg max-sm:text-base lg:text-xl text-neutral-100 font-semibold tracking-tight">
              {title}
            </h2>
            {isMobile ? (
              <Link
                to={`/${mediaType}/list/$list`}
                params={{ list }}
                search={{ page: 1 }}
                className="text-sm text-blue-500 font-medium hover:underline"
              >
                View more
              </Link>
            ) : (
              <Link
                to={`/${mediaType}/list/$list`}
                params={{ list }}
                search={{ page: 1 }}
              >
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-300"
                >
                  {`View All ${title}`}
                </Button>
              </Link>
            )}
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
            {isMobile ? (
              <GridSkeleton />
            ) : (
              <MediaListSkeleton />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Mobile Grid Layout */}
            {isMobile ? (
              <div className="w-full">
                {isError ? (
                  <motion.div
                    className="w-full text-center text-red-400 font-medium py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Error: {error?.message ?? "An error occurred while fetching data."}
                  </motion.div>
                ) : data?.results && data.results.length > 0 ? (
                  <motion.div
                    className="grid grid-cols-2 gap-2 justify-items-center"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.1,
                          delayChildren: 0.2
                        }
                      },
                    }}
                  >
                    {data.results.map((item: MediaProps, index) => (
                      <motion.div
                        key={item.id}
                        className="flex-shrink-0"
                        variants={cardVariants}
                        transition={{ delay: index * 0.05 /* kept delay only */ }}
                      >
                        <MediaCard
                          id={item.id}
                          title={item.title || item.name || "Untitled"}
                          release_date={item.release_date || item.first_air_date || ""}
                          poster_path={item.poster_path}
                          vote_average={item.vote_average}
                          type={mediaType}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    className="w-full text-center text-neutral-400 py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    No {mediaType === "movie" ? "movies" : "TV shows"} found for this list.
                  </motion.div>
                )}
              </div>
            ) : (
              /* Desktop Horizontal Scroller */
              <div className="relative">
                {/* Left scroll button */}
                <AnimatePresence>
                  {canScrollLeft && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      type="button"
                      onClick={() => scrollByAmount("left")}
                      aria-label="Scroll left"
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-[#111]/60 text-white shadow-lg hover:bg-[#111]/80 transition-all duration-200"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18l-6-6 6-6"></path>
                      </svg>
                    </motion.button>
                  )}
                </AnimatePresence>
                {/* Right scroll button */}
                <AnimatePresence>
                  {canScrollRight && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      type="button"
                      onClick={() => scrollByAmount("right")}
                      aria-label="Scroll right"
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-[#111]/60 text-white shadow-lg hover:bg-[#111]/80 transition-all duration-200"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 6l6 6-6 6"></path>
                      </svg>
                    </motion.button>
                  )}
                </AnimatePresence>
                {/* Error state */}
                {isError ? (
                  <motion.div
                    className="w-full text-center text-red-400 font-medium py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Error: {error?.message ?? "An error occurred while fetching data."}
                  </motion.div>
                ) : (
                  // Actual data: horizontal scrollable row
                  data?.results && data.results.length > 0 ? (
                    <div ref={scrollerRef} className="w-full overflow-x-auto no-scrollbar">
                      <motion.div
                        className="flex gap-2 lg:gap-3 items-stretch justify-start pl-4 sm:pl-6 lg:pl-8"
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
                        {data.results.map((item: MediaProps, index) => (
                          <motion.div
                            key={item.id}
                            variants={cardVariants}
                            transition={{ delay: index * 0.03 /* kept duration/delay only */ }}
                            className="flex-shrink-0"
                          >
                            <MediaCard
                              id={item.id}
                              title={item.title || item.name || "Untitled"}
                              release_date={item.release_date || item.first_air_date || ""}
                              poster_path={item.poster_path}
                              vote_average={item.vote_average}
                              type={mediaType}
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  ) : (
                    <motion.div
                      className="w-full text-center text-neutral-400 py-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      No {mediaType === "movie" ? "movies" : "TV shows"} found for this list.
                    </motion.div>
                  )
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};
export default MediaList;