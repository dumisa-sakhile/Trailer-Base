import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react"; // Import Lucide React icons

interface CreditsProps {
  creditsLoading: boolean;
  children: React.ReactNode;
}

// --- Utility Hook (reused from other components) ---
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

// --- CastCardSkeleton Component ---
/**
 * CastCardSkeleton Component
 * Renders a skeleton placeholder for a single cast/person card.
 * It mimics the layout and dimensions of the actual CastCard.
 */
const CastCardSkeleton: React.FC = () => (
  <div
    className="flex flex-col items-center text-center animate-pulse flex-shrink-0
                  rounded-lg p-4 bg-neutral-800"
    style={{ width: "150px" }}>
    {" "}
    {/* Fixed width to match CastCard */}
    {/* Profile image placeholder */}
    <div className="w-24 h-24 bg-neutral-700 rounded-full mb-2"></div>
    {/* Name placeholder */}
    <div className="h-4 bg-neutral-600 rounded w-3/4 mb-1"></div>
    {/* Role/Department placeholder */}
    <div className="h-3 bg-neutral-600 rounded w-1/2"></div>
  </div>
);

// --- Credits Component ---
const Credits: React.FC<CreditsProps> = ({ creditsLoading, children }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { width: windowWidth } = useWindowSize();

  const scrollAmount = 200; // Pixels to scroll

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Calculate number of skeletons to display based on screen width
  // Assuming each CastCard is roughly 150px wide + some gap
  const castCardWidth = 150;
  const cardGap = 16; // Assuming gap-4, adjust if your actual CastCard has different margin/gap
  const containerPadding = 16 * 2; // Assuming px-4 on parent container
  const visibleWidth = Math.max(0, windowWidth - containerPadding);
  const numSkeletons = Math.floor(visibleWidth / (castCardWidth + cardGap));
  const skeletonsToRender = Math.max(numSkeletons, 5); // Ensure at least 5 skeletons are shown

  return (
    <div className="relative">
      <h1 className="text-3xl max-sm:text-2xl lg:text-4xl font-medium tracking-tight text-white mb-4">
        The Cast
      </h1>
      {/* Left Scroll Button */}
      <button
        onClick={scrollLeft}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-neutral-900/70 hover:bg-neutral-800/90 p-2 rounded-full transition-colors duration-200 hidden md:block" // Hide on small screens, show on md and up
        aria-label="Scroll left">
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <div
        ref={scrollRef}
        className="overflow-x-scroll flex flex-nowrap items-start justify-start gap-4 py-2 custom-scrollbar" // Added custom-scrollbar
      >
        {creditsLoading
          ? // Render skeleton cards when loading
            Array.from({ length: skeletonsToRender }).map((_, index) => (
              <CastCardSkeleton key={index} />
            ))
          : // Render actual children when loaded
            children}
      </div>

      {/* Right Scroll Button */}
      <button
        onClick={scrollRight}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-neutral-900/70 hover:bg-neutral-800/90 p-2 rounded-full transition-colors duration-200 hidden md:block" // Hide on small screens, show on md and up
        aria-label="Scroll right">
        <ChevronRight className="w-6 h-6 text-white" />
      </button>
    </div>
  );
};

export default Credits;
