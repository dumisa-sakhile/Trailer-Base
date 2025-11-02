import React, { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import MediaCard from "./MediaCard"; // Ensure this import path is correct

// Define interfaces for Media properties and MediaList component props
interface MediaProps {
  id: number;
  title?: string; // Optional for movies
  name?: string; // Optional for TV
  release_date?: string; // Optional for movies
  first_air_date?: string; // Optional for TV
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
// These values should align with the max-sm and default sizes in MediaCard's className
const DEFAULT_CARD_WIDTH = 260; // Equivalent to w-[260px]
const SM_CARD_WIDTH = 120; // Equivalent to max-sm:w-[120px]
const GAP = 16; // Corresponds to Tailwind's gap-4 (16px) or lg:gap-6 (24px). Using 16px as a base.

// Custom hook to get window dimensions for responsiveness in skeletons
// This helps the skeleton dynamically adjust the number of placeholder cards
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
 * It mimics the layout and dimensions of the actual MediaCard,
 * using neutral colors and an animating pulse effect.
 */
const MediaCardSkeleton: React.FC = () => (
  <div
    className="relative w-[260px] h-[390px] max-sm:w-[120px] max-sm:h-[180px]
                  bg-neutral-800 rounded-2xl animate-pulse overflow-hidden">
    {/* Placeholder for the image area, filling the card */}
    <div className="absolute inset-0 bg-neutral-700"></div>

    {/* Placeholder for the content overlay (rating, date, title) at the bottom of the card */}
    <div
      className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/40 to-transparent
                    flex flex-col justify-end p-4 max-sm:p-2">
      {/* Skeleton for rating/year line */}
      <div className="h-4 w-1/3 bg-neutral-600 rounded mb-2 max-sm:h-3 max-sm:w-1/2"></div>
      {/* Skeleton for title line 1 */}
      <div className="h-5 w-3/4 bg-neutral-600 rounded mb-1 max-sm:h-4 max-sm:w-2/3"></div>
      {/* Skeleton for title line 2 */}
      <div className="h-5 w-1/2 bg-neutral-600 rounded max-sm:h-4 max-sm:w-1/2"></div>
    </div>

    {/* Placeholder for the bookmark button at the top-left */}
    <div className="absolute top-3 left-3 p-2 bg-neutral-700 rounded-full shadow-md max-sm:p-1.5 max-sm:top-2 max-sm:left-2">
      {/* Inner circle for the bookmark icon */}
      <div className="w-5 h-5 bg-neutral-600 rounded-full max-sm:w-4 max-sm:h-4"></div>
    </div>
  </div>
);

/**
 * MediaListSkeleton Component
 * Horizontal, scrollable skeleton with left/right buttons (mirrors MediaList layout).
 */
const MediaListSkeleton: React.FC = () => {
  const { width: windowWidth } = useWindowSize();
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Determine size per card
  const currentCardWidth = windowWidth < 640 ? SM_CARD_WIDTH : DEFAULT_CARD_WIDTH;
  const horizontalPadding = 32 * 2; // matches section padding approximation
  const effectiveWidth = Math.max(0, windowWidth - horizontalPadding);
  const cardsPerView = Math.max(1, Math.floor(effectiveWidth / (currentCardWidth + GAP)));
  const numberOfSkeletons = Math.max(cardsPerView * 2, 6); // at least 2 "screens" worth

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
  }, [numberOfSkeletons]);

  const scrollByAmount = (direction: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.8, 300);
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className="relative -mx-4 px-4">
      <button
        type="button"
        onClick={() => scrollByAmount("left")}
        aria-label="Scroll left"
        className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-[#111]/60 text-white shadow-lg transition-opacity ${
          canScrollLeft ? "opacity-100" : "opacity-30 pointer-events-none"
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
        className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-[#111]/60 text-white shadow-lg transition-opacity ${
          canScrollRight ? "opacity-100" : "opacity-30 pointer-events-none"
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 6l6 6-6 6"></path>
        </svg>
      </button>

      <div ref={scrollerRef} className="w-full overflow-x-auto no-scrollbar">
        <div className="flex gap-4 lg:gap-6 items-stretch py-2">
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
 * MediaList Component
 * Displays a list of media items (movies or TV shows) with a title and a "View All" link.
 * It integrates a custom skeleton loading state when data is being fetched.
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
  // Variants for Framer Motion animation for individual cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const scrollerRef = useRef<HTMLDivElement | null>(null);
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
    const amount = Math.max(el.clientWidth * 0.8, 300); // scroll by 80% viewport or min 300px
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="w-full flex flex-col gap-4 px-4 sm:px-6 lg:px-8 py-6">
      {/* Header row: Title + View All */}
      {!isLoading && (
        <div className="w-full flex items-center justify-between">
          <h2 className="text-2xl max-sm:text-xl lg:text-3xl text-neutral-100 font-medium capitalize tracking-tight">
            {title}
          </h2>
          <Link
            to={`/${mediaType}/list/$list`}
            params={{ list: list }}
            search={{ page: 1 }}>
            <button className="px-3 py-2 text-xs md:text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-all duration-300">
              View All {title}
            </button>
          </Link>
        </div>
      )}

      <div className="h-4" /> {/* Spacer */}

      {/* When loading, render the horizontal skeleton component */}
      {isLoading ? (
        <MediaListSkeleton />
      ) : (
        <div className="relative -mx-4 px-4">
          {/* Left scroll button */}
          <button
            type="button"
            onClick={() => scrollByAmount("left")}
            aria-label="Scroll left"
            className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-[#111]/60 text-white shadow-lg transition-opacity ${
              canScrollLeft ? "opacity-100" : "opacity-30 pointer-events-none"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6"></path>
            </svg>
          </button>

          {/* Right scroll button */}
          <button
            type="button"
            onClick={() => scrollByAmount("right")}
            aria-label="Scroll right"
            className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-[#111]/60 text-white shadow-lg transition-opacity ${
              canScrollRight ? "opacity-100" : "opacity-30 pointer-events-none"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 6l6 6-6 6"></path>
            </svg>
          </button>

          {/* Error state */}
          {isError ? (
            <div className="w-full text-center text-red-400 font-medium py-8">
              Error: {error?.message ?? "An error occurred while fetching data."}
            </div>
          ) : (
            // Actual data: horizontal scrollable row
            data?.results && data.results.length > 0 ? (
              <div ref={scrollerRef} className="w-full overflow-x-auto no-scrollbar">
                <motion.div
                  className="flex gap-4 lg:gap-6 items-stretch"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
                  }}>
                  {data.results.map((item: MediaProps) => (
                    <motion.div key={item.id} variants={cardVariants} className="flex-shrink-0">
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
              <div className="w-full text-center text-neutral-400 py-8">
                No {mediaType === "movie" ? "movies" : "TV shows"} found for this list.
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
};

export default MediaList;
