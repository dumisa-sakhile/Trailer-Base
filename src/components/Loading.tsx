import React, { useState, useEffect } from "react";
import type { FC } from "react";
import { motion } from "framer-motion";

// --- Utility Hook ---

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
 * GenericContentCardSkeleton Component
 * Renders a simplified skeleton placeholder for a generic content card.
 * This is used within the main GenericLoadingSkeleton to mimic content blocks.
 */
const GenericContentCardSkeleton: React.FC = () => {
  return (
    <div
      className="relative w-40 h-60 sm:w-48 sm:h-72 md:w-56 md:h-80 lg:w-64 lg:h-96
                    bg-neutral-800 rounded-lg animate-pulse overflow-hidden flex-shrink-0">
      {/* Image area placeholder */}
      <div className="w-full h-3/4 bg-neutral-700"></div>
      {/* Text lines placeholder */}
      <div className="p-2 flex flex-col gap-2">
        <div className="h-4 bg-neutral-600 rounded w-full"></div>
        <div className="h-4 bg-neutral-600 rounded w-3/4"></div>
      </div>
    </div>
  );
};

/**
 * GenericLoadingSkeleton Component
 * Renders a full-screen, content-resembling skeleton to indicate a general loading state for the app.
 * It includes placeholders for a header and a responsive grid of content cards.
 */
const Loading: FC = () => {
  const { width: windowWidth } = useWindowSize();

  // Approximate card dimensions and gap for calculation
  const baseCardWidth = 160; // Average of mobile/small desktop card widths
  const baseCardGap = 16; // Tailwind gap-4

  const horizontalPadding = 16 * 2; // px-4 on main container
  const effectiveWidth = Math.max(0, windowWidth - horizontalPadding);
  const cardsPerRow = Math.floor(
    effectiveWidth / (baseCardWidth + baseCardGap)
  );
  const numberOfSkeletons = Math.max(cardsPerRow * 3, 6); // Show at least 3 rows, min 6 cards

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center bg-neutral-950 text-white p-4 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}>
      {/* Header/Title Placeholder */}
      <div className="w-full max-w-4xl h-10 bg-neutral-800 rounded-lg mb-8 mt-16 animate-pulse"></div>

      {/* Main Content Grid Placeholder */}
      <div className="w-full max-w-7xl flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-8 overflow-y-auto custom-scrollbar">
        {Array.from({ length: numberOfSkeletons }).map((_, index) => (
          <GenericContentCardSkeleton key={index} />
        ))}
      </div>

      {/* Optional: Footer or pagination placeholder if common */}
      <div className="w-full max-w-md h-12 bg-neutral-800 rounded-full mt-8 mb-4 animate-pulse"></div>
    </motion.div>
  );
};

export default Loading;
