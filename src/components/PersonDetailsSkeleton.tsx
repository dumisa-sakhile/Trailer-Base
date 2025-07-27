import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Defines the dimensions for MediaCard for accurate skeleton sizing
const MEDIA_CARD_WIDTH_DESKTOP = 260;
const MEDIA_CARD_WIDTH_MOBILE = 120;
const CARD_GAP_MD = 24; // md:gap-6
const CARD_GAP_SM = 8; // gap-2

// Custom hook to get window dimensions for responsive skeleton calculations
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
 * MediaCardSkeleton Component (reused for consistency)
 * Renders a skeleton placeholder for a single movie/TV show card.
 * It mimics the layout and dimensions of the actual MediaCard,
 * using neutral colors and an animating pulse effect.
 */
const MediaCardSkeleton: React.FC = () => {
  return (
    <div
      className="relative w-[260px] h-[390px] max-sm:w-[120px] max-sm:h-[180px]
                    bg-neutral-800 rounded-2xl animate-pulse overflow-hidden">
      {/* Image area placeholder */}
      <div className="absolute inset-0 bg-neutral-700"></div>
      {/* Content overlay placeholder */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/40 to-transparent
                      flex flex-col justify-end p-4 max-sm:p-2">
        {/* Rating/Year placeholder */}
        <div className="h-4 w-1/3 bg-neutral-600 rounded mb-2 max-sm:h-3 max-sm:w-1/2"></div>
        {/* Title line 1 placeholder */}
        <div className="h-5 w-3/4 bg-neutral-600 rounded mb-1 max-sm:h-4 max-sm:w-2/3"></div>
        {/* Title line 2 placeholder */}
        <div className="h-5 w-1/2 bg-neutral-600 rounded max-sm:h-4 max-sm:w-1/2"></div>
      </div>
      {/* Bookmark button placeholder */}
      <div className="absolute top-3 left-3 p-2 bg-neutral-700 rounded-full shadow-md max-sm:p-1.5 max-sm:top-2 max-sm:left-2">
        <div className="w-5 h-5 bg-neutral-600 rounded-full max-sm:w-4 max-sm:h-4"></div>
      </div>
    </div>
  );
};

/**
 * PersonDetailsSkeleton Component
 * Renders a custom skeleton loading state for the Person Details page.
 * It mimics the layout of the person's profile, biography, and credit sections.
 */
const PersonDetailsSkeleton: React.FC = () => {
  const { width: windowWidth } = useWindowSize();

  let cardWidth = MEDIA_CARD_WIDTH_DESKTOP;
  let cardGap = CARD_GAP_MD;
  let horizontalPadding = 16 * 2; // px-4 initially

  if (windowWidth < 640) {
    // sm breakpoint
    cardWidth = MEDIA_CARD_WIDTH_MOBILE;
    cardGap = CARD_GAP_SM; // gap-2
    horizontalPadding = 16 * 2; // px-4
  } else if (windowWidth < 1024) {
    // lg breakpoint
    horizontalPadding = 24 * 2; // sm:px-6
  } else {
    // lg and up
    horizontalPadding = 32 * 2; // lg:px-8
  }

  const effectiveWidth = Math.max(0, windowWidth - horizontalPadding);
  const cardsPerRow = Math.floor(effectiveWidth / (cardWidth + cardGap));
  const numberOfSkeletons = Math.max(cardsPerRow * 2, 6); // Show at least 2 rows, min 6 cards per section

  return (
    <motion.div
      className="relative w-full min-h-screen bg-black text-white animate-pulse"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col gap-8">
        {/* Back Home Button Placeholder */}
        <div className="h-10 w-28 bg-neutral-800 rounded-full mb-4"></div>

        {/* Header Section Skeleton */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Image Skeleton */}
          <div className="flex-shrink-0 mx-auto md:mx-0 w-64 h-96 bg-neutral-800 rounded-2xl shadow-lg"></div>

          {/* Details Section Skeleton */}
          <div className="flex flex-col gap-6 flex-grow">
            {/* Name Skeleton */}
            <div className="h-10 bg-neutral-700 rounded w-3/4 max-w-[400px]"></div>

            {/* Metadata Badges Skeleton */}
            <div className="flex flex-wrap gap-3">
              <div className="h-8 w-24 bg-neutral-700 rounded-full"></div>
              <div className="h-8 w-32 bg-neutral-700 rounded-full"></div>
              <div className="h-8 w-28 bg-neutral-700 rounded-full"></div>
              <div className="h-8 w-20 bg-neutral-700 rounded-full"></div>
            </div>

            {/* Biography Section Skeleton */}
            <div className="bg-neutral-800 p-6 rounded-lg shadow-lg ring-1 ring-neutral-700 max-w-3xl mx-auto w-full">
              <div className="h-6 bg-neutral-700 rounded w-1/3 mb-4"></div>{" "}
              {/* Biography title */}
              <div className="h-4 bg-neutral-600 rounded w-full mb-2"></div>
              <div className="h-4 bg-neutral-600 rounded w-5/6 mb-2"></div>
              <div className="h-4 bg-neutral-600 rounded w-full"></div>
            </div>
          </div>
        </div>

        {/* Movie Credits Section Skeleton */}
        <section className="mt-6">
          <div className="h-10 bg-neutral-700 rounded w-1/4 max-w-[150px] mb-4"></div>{" "}
          {/* Movies title */}
          <div className="w-full flex flex-wrap justify-center gap-2 md:gap-10 pb-10">
            {Array.from({ length: numberOfSkeletons }).map((_, index) => (
              <MediaCardSkeleton key={index} />
            ))}
          </div>
        </section>

        {/* TV Credits Section Skeleton */}
        <section className="mt-6">
          <div className="h-10 bg-neutral-700 rounded w-1/4 max-w-[150px] mb-4"></div>{" "}
          {/* TV Shows title */}
          <div className="w-full flex flex-wrap justify-center gap-2 md:gap-10 pb-10">
            {Array.from({ length: numberOfSkeletons }).map((_, index) => (
              <MediaCardSkeleton key={index} />
            ))}
          </div>
        </section>
      </div>

      {/* Footer Placeholder */}
      <div className="w-full h-20 bg-neutral-900"></div>
    </motion.div>
  );
};

export default PersonDetailsSkeleton;
