import React, { useState, useEffect } from "react";

// Define card dimensions for the skeleton to match MediaCard's actual sizes
const MEDIA_CARD_WIDTH_DESKTOP = 260;

const MEDIA_CARD_WIDTH_MOBILE = 120;

const CARD_GAP = 24; // Corresponds to Tailwind's gap-6 (24px) or gap-10 (40px). Using 24px as a common base.

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
 * MediaCardSkeleton Component
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
 * MediaGridSkeleton Component
 * Renders a full skeleton for a page section that displays a grid of media cards.
 * It includes a placeholder for the section title and a responsive grid of `MediaCardSkeleton`s.
 * This component is designed to be independent and reusable across different pages.
 */
interface MediaGridSkeletonProps {
  // Optional: You can pass a title to make the skeleton's title placeholder more specific,
  // e.g., "Loading Movies" or "Loading Action Movies"
  titleText?: string;
}

const MediaGridSkeleton: React.FC<MediaGridSkeletonProps> = ({ titleText }) => {
  const { width: windowWidth } = useWindowSize();

  let cardWidth = MEDIA_CARD_WIDTH_DESKTOP;
  let cardGap = CARD_GAP;
  let horizontalPadding = 40; // Based on p-4 md:pl-10 lg:pl-20, using a rough average

  // Adjust for mobile screens (e.g., px-4 in main section)
  if (windowWidth < 768) {
    // md breakpoint
    cardWidth = MEDIA_CARD_WIDTH_MOBILE;
    cardGap = 8; // gap-2
    horizontalPadding = 16; // px-4
  }

  // Calculate how many skeletons can fit in the available width
  const effectiveWidth = Math.max(0, windowWidth - horizontalPadding * 2);
  const cardsPerRow = Math.floor(effectiveWidth / (cardWidth + cardGap));
  // Render enough skeletons to fill at least 3 rows, with a minimum of 9 cards
  const numberOfSkeletons = Math.max(cardsPerRow * 3, 9);

  return (
    <div className="fixed top-0 left-0 w-full h-full pt-[15%] md:pt-[5%] p-4 md:pl-10 lg:pl-20 flex flex-col gap-8 pb-10 animate-pulse">
      {/* Title placeholder */}
      <h1 className="-mt-10 h-8 bg-neutral-700 rounded w-1/4 max-w-[250px]">
        {/* If titleText is provided, it can be used as an accessible label or for debugging */}
        <span className="sr-only">{titleText || "Loading Content"}</span>
      </h1>
      {/* Grid of media card skeletons */}
      <section className="w-full min-h-1/2 md:p-4 flex flex-wrap items-start justify-center gap-2 lg:gap-10">
        {Array.from({ length: numberOfSkeletons }).map((_, index) => (
          <MediaCardSkeleton key={index} />
        ))}
      </section>
      {/* Placeholder for pagination if applicable, or just a spacer */}
      <div className="h-10 w-full bg-transparent"></div>{" "}
      {/* Spacer for bottom content */}
    </div>
  );
};

export default MediaGridSkeleton;
