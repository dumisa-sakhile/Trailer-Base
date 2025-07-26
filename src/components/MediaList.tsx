import React, { useState, useEffect } from "react";
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
 * Renders a full skeleton for the entire MediaList section.
 * This includes placeholders for the section title, "View All" button,
 * and a responsive grid of MediaCardSkeleton components.
 */
const MediaListSkeleton: React.FC = () => {
  const { width: windowWidth } = useWindowSize();

  // Determine the current card width based on screen size for accurate calculation
  let currentCardWidth = DEFAULT_CARD_WIDTH;
  if (windowWidth < 640) {
    // Tailwind's 'sm' breakpoint is typically 640px
    currentCardWidth = SM_CARD_WIDTH;
  }

  // Calculate how many cards can fit in a row, considering section padding (e.g., px-8 = 32px each side)
  // This is an approximation for responsive layout.
  const horizontalPadding = 32 * 2; // Assuming px-8 on both sides
  const effectiveWidth = Math.max(0, windowWidth - horizontalPadding);
  const cardsPerRow = Math.floor(effectiveWidth / (currentCardWidth + GAP));

  // Render enough skeletons to fill at least 2-3 rows, or a minimum number if the screen is very small
  const numberOfSkeletons = Math.max(cardsPerRow * 3, 6); // Ensures at least 6 skeletons are shown

  return (
    <section className="w-full flex flex-col items-center justify-center gap-4 px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
      <div className="w-full flex items-center justify-between">
        {/* Skeleton for the section title */}
        <div className="h-8 md:h-10 lg:h-12 bg-neutral-700 rounded w-1/3 max-w-[280px]"></div>
        {/* Skeleton for the "View All" button */}
        <div className="h-9 w-28 bg-blue-700 rounded-md"></div>
      </div>
      <div className="h-4" /> {/* Spacer div to match actual layout */}
      <div className="w-full flex flex-wrap justify-center sm:justify-start gap-4 lg:gap-6">
        {/* Render a grid of individual MediaCardSkeletons */}
        {Array.from({ length: numberOfSkeletons }).map((_, index) => (
          <MediaCardSkeleton key={index} />
        ))}
      </div>
    </section>
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

  return (
    <section className="w-full flex flex-col items-center justify-center gap-4 px-4 sm:px-6 lg:px-8 py-6">
      {/* Conditional rendering for the actual title and "View All" button */}
      {!isLoading && (
        <div className="w-full flex items-center justify-between">
          {/* Section title */}
          <h2 className="text-2xl max-sm:text-xl lg:text-4xl text-neutral-100 font-medium capitalize tracking-tight">
            {title}
          </h2>
          {/* Link to view all items in the category */}
          <Link
            to={`/${mediaType}/list/$list`}
            params={{ list: list }}
            search={{ page: 1 }}>
            <button className="px-3 py-2 text-xs md:text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              View All {title}
            </button>
          </Link>
        </div>
      )}
      <div className="h-4" /> {/* Spacer div */}
      {/* Conditional rendering for loading, error, or data display */}
      {isLoading && <MediaListSkeleton />}{" "}
      {/* Show the custom list skeleton when loading */}
      {isError && (
        <div className="w-full text-center text-red-400 font-medium py-8">
          Error: {error?.message ?? "An error occurred while fetching data."}
        </div>
      )}
      {/* Render actual media cards if not loading, no error, and data is available */}
      {!isLoading && !isError && data?.results && data.results.length > 0 && (
        <motion.div
          className="w-full flex flex-wrap justify-center sm:justify-start gap-4 lg:gap-6"
          initial="hidden"
          // Animate children with a slight stagger effect
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
          }}>
          {data.results.map((item: MediaProps) => (
            <motion.div
              key={item.id}
              variants={cardVariants}
              className="flex-shrink-0" // Prevents cards from shrinking in flex container
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
      )}
      {/* Message for when no results are found */}
      {!isLoading &&
        !isError &&
        (!data?.results || data.results.length === 0) && (
          <div className="w-full text-center text-neutral-400 py-8">
            No {mediaType === "movie" ? "movies" : "TV shows"} found for this
            list.
          </div>
        )}
    </section>
  );
};

export default MediaList;
