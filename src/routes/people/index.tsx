import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getTrendingPeople, getPopularPeople } from "@/api/people";
import { useSearchContext } from "@/context/searchContext";
import React, { useEffect, useRef, useState } from "react";
import CastCard from "@/components/PeopleCastCard"; // Assuming this is the correct path
import Footer from "@/components/Footer";
import { LeftIcon, RightIcon } from "@/components/icons/Icons";
import { motion } from "framer-motion";
import { Search as SearchIconLucide } from "lucide-react";

// Interfaces for route search parameters
interface pageProps {
  page?: number;
}

// Define route for /people/
export const Route = createFileRoute("/people/")({
  validateSearch: (search: Record<string, string>): pageProps => ({
    page: search.page ? parseInt(search.page) : 1,
  }),
  component: People,
});

// --- Utility Hook ---

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

// --- Skeleton Components ---

/**
 * CastCardSkeleton Component
 * Renders a skeleton placeholder for a single cast card.
 * It mimics the layout and dimensions of the actual CastCard,
 * using neutral colors and an animating pulse effect, ensuring proper alignment.
 */
const CastCardSkeleton: React.FC = () => (
  // The outer div mimics the `w-[150px]` and `p-4` of the actual CastCard's Link wrapper.
  <div
    className="flex flex-col items-center text-center animate-pulse flex-shrink-0
                  rounded-lg p-4 bg-neutral-800"
    style={{ width: "150px" }}>
    {/* Profile image placeholder: Matches w-24 h-24 (96px) and rounded-full */}
    <div className="w-24 h-24 bg-neutral-700 rounded-full mb-2"></div>
    {/* Name placeholder: h-4 for text line, w-3/4 for approximate length */}
    <div className="h-4 bg-neutral-600 rounded w-3/4 mb-1"></div>
    {/* Character/Department placeholder: h-3 for smaller text, w-1/2 for approximate length */}
    <div className="h-3 bg-neutral-600 rounded w-1/2"></div>
  </div>
);

/**
 * PeopleSectionSkeleton Component
 * Renders a full skeleton for a section of people (e.g., Trending or Popular).
 * This includes placeholders for the section title, optional carousel controls or pagination,
 * and a responsive grid of CastCardSkeleton components.
 */
interface PeopleSectionSkeletonProps {
  hasCarouselControls?: boolean; // True for trending section (shows navigation buttons)
  hasPagination?: boolean; // True for popular section (shows pagination controls)
  titleWidth?: string; // Tailwind width class for title skeleton, e.g., "w-1/3"
  isCarousel?: boolean; // True if the section uses a horizontal scroll carousel layout
}

const PeopleSectionSkeleton: React.FC<PeopleSectionSkeletonProps> = ({
  hasCarouselControls = false,
  hasPagination = false,
  titleWidth = "w-1/2", // Default width for title skeleton
  isCarousel = false,
}) => {
  const { width: windowWidth } = useWindowSize();

  // Approximate dimensions for calculating number of skeletons
  const cardWidth = 150; // Matches the fixed width of CastCard
  const cardGap = 16; // Assuming Tailwind's gap-4 (16px)
  const horizontalPadding = 16 * 2; // Assuming px-4 on both sides of the container

  const effectiveWidth = Math.max(0, windowWidth - horizontalPadding);
  const cardsPerRow = Math.floor(effectiveWidth / (cardWidth + cardGap));

  // Determine the number of skeletons to display.
  // For carousels, show enough to fill at least one visible row.
  // For grids, show enough for a few rows to indicate a larger list.
  const numberOfSkeletons = Math.max(cardsPerRow * (isCarousel ? 1 : 3), 6); // Min 6 skeletons

  return (
    <section className="relative w-full py-2 animate-pulse">
      {/* Header section for title and controls/pagination */}
      <div className="flex items-center justify-between mb-2 px-2 sm:px-4">
        {/* Title skeleton */}
        <div className={`h-8 bg-neutral-700 rounded ${titleWidth}`}></div>
        {/* Carousel controls skeleton */}
        {hasCarouselControls && (
          <div className="flex gap-1 sm:gap-2">
            <div className="p-1.5 sm:p-2.5 rounded-md bg-neutral-700 w-8 h-8"></div>
            <div className="p-1.5 sm:p-2.5 rounded-md bg-neutral-700 w-8 h-8"></div>
          </div>
        )}
      </div>

      {/* Container for the people cards skeletons */}
      <div
        className={`flex gap-4 pb-2 px-2 sm:px-4 ${isCarousel ? "overflow-x-hidden" : "flex-wrap justify-center md:justify-start"}`}
        // Set a minHeight to prevent layout shifts during loading, especially for carousels
        style={{ minHeight: isCarousel ? "250px" : "auto" }}>
        {Array.from({ length: numberOfSkeletons }).map((_, index) => (
          <CastCardSkeleton key={index} />
        ))}
      </div>

      {/* Pagination skeleton (for sections like Popular People) */}
      {hasPagination && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="h-9 w-20 bg-neutral-700 rounded-md"></div>{" "}
          {/* Prev button placeholder */}
          <div className="h-5 w-24 bg-neutral-600 rounded"></div>{" "}
          {/* Page numbers placeholder */}
          <div className="h-9 w-20 bg-neutral-700 rounded-md"></div>{" "}
          {/* Next button placeholder */}
        </div>
      )}
    </section>
  );
};

// --- Main People Component ---
function People() {
  const search = Route.useSearch();
  const { page = 1 } = search;
  const { setStatus } = useSearchContext();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");

  // Debounce search input to navigate to /search after a short delay
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput) {
        navigate({
          to: "/search",
          search: { query: searchInput, type: "people", page: 1 },
        });
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(handler); // Cleanup on unmount or searchInput change
  }, [searchInput, navigate]);

  // Handler for search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const trendingPage = 1; // Always fetch the first page for trending
  const [period, setPeriod] = useState("day"); // State for trending period (day/week)

  // React Query for Trending People data
  const {
    data: trendingData,
    isLoading: trendingLoading,
    isError: trendingError,
    error: trendingErrorObj,
  } = useQuery({
    queryKey: ["trendingPeople", period, trendingPage],
    queryFn: () => getTrendingPeople(period, trendingPage),
    placeholderData: keepPreviousData, // Keep previous data while fetching new
    staleTime: 60 * 60 * 1000, // Data considered fresh for 1 hour
  });

  // React Query for Popular People data
  const {
    data: popularData,
    isLoading: popularLoading,
    isError: popularError,
    error: popularErrorObj,
  } = useQuery({
    queryKey: ["popularPeople", page],
    queryFn: () => getPopularPeople(page),
    placeholderData: keepPreviousData, // Keep previous data while fetching new
    staleTime: 60 * 60 * 1000, // Data considered fresh for 1 hour
  });

  // Effect to set search status (likely for a global search bar)
  useEffect(() => {
    setStatus(false);
  }, [setStatus]);

  // Carousel functionality for Trending People section
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Updates the scroll state (whether left/right scroll buttons should be active)
  const updateScrollState = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 0);
    // Can scroll right if content width is greater than visible width plus current scroll position
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
  };

  // Add/remove scroll event listeners for the carousel
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    updateScrollState(); // Initial state check
    carousel.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState); // Update on window resize

    return () => {
      carousel.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [trendingData]); // Re-run effect when trendingData changes (e.g., period switch)

  // Scrolls the carousel left or right
  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;

    const { scrollLeft, clientWidth } = carouselRef.current;
    const scrollAmount = clientWidth * 0.8; // Scroll by 80% of the visible width

    carouselRef.current.scrollTo({
      left:
        direction === "right"
          ? scrollLeft + scrollAmount
          : scrollLeft - scrollAmount,
      behavior: "smooth", // Smooth scrolling animation
    });
  };

  // Framer Motion animation variants for staggered appearance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Delay between children animations
        delayChildren: 0.2, // Initial delay before children start animating
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 }, // Start hidden, slightly below
    visible: {
      opacity: 1,
      y: 0, // Animate to original position
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="w-full md:pt-16 flex flex-col  text-white poppins-light">
      <title>Trailer Base - People</title>

      {/* Mobile-only search section: Only visible on smaller screens */}
      <section className="md:hidden px-4 pt-6">
        <h1 className="text-3xl text-white text-center font-extrabold tracking-tight mb-4">
          Find Your Favorite Star
        </h1>
        <div className="relative">
          <input
            type="search"
            placeholder="Search people, e.g. Nomzamo Mbatha"
            value={searchInput}
            onChange={handleSearchChange}
            className="w-full h-12 px-5 py-3 rounded-full bg-[#242424] border border-[#141414] text-base text-white placeholder:text-white pl-12 pr-4 leading-6 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all font-normal shadow-lg"
            aria-label="Search people"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2">
            <SearchIconLucide size={18} className="text-neutral-400" />
          </span>
        </div>
      </section>

      {/* Main Page Title and Description Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full flex flex-col items-center justify-center gap-4 py-4">
        <motion.h1
          variants={itemVariants}
          className="text-3xl max-sm:text-2xl lg:text-4xl font-medium tracking-tight text-center">
          Trailer Base - People
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="text-sm sm:text-base font-light text-center max-w-2xl">
          Welcome to Trailer Base, where you can explore the stars of film and
          TV. These are the trending people of the{" "}
          <span className="font-semibold uppercase">{period}</span>.
        </motion.p>
      </motion.section>

      {/* Period Selection Buttons (Day/Week) */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-center gap-2 py-2">
        <motion.button
          variants={itemVariants}
          onClick={() => setPeriod("day")}
          className={`px-4 py-2 rounded-full transition-all duration-200 ${
            period === "day"
              ? "bg-[#333]/50 ring-1 ring-white/10" // Active state styling
              : "opacity-30 hover:opacity-80 hover:bg-blue-900/20 hover:scale-105 ring-1 ring-blue-400/10" // Inactive state styling
          }`}>
          Day
        </motion.button>
        <motion.button
          variants={itemVariants}
          onClick={() => setPeriod("week")}
          className={`px-4 py-2 rounded-full transition-all duration-200 ${
            period === "week"
              ? "bg-[#333]/50 ring-1 ring-white/10" // Active state styling
              : "opacity-30 hover:opacity-80 hover:bg-blue-900/20 hover:scale-105 ring-1 ring-blue-400/10" // Inactive state styling
          }`}>
          Week
        </motion.button>
      </motion.section>

      {/* Trending People Section: Conditionally renders skeleton or actual content */}
      <section className="relative w-full max-w-[98vw] py-2">
        {trendingLoading ? (
          // Show skeleton when trending data is loading
          <PeopleSectionSkeleton
            hasCarouselControls={true}
            isCarousel={true}
            titleWidth="w-1/4"
          />
        ) : trendingError ? (
          // Show error message if trending data failed to load
          <p className="text-center text-red-500 px-4">
            Error loading trending people: {trendingErrorObj?.message}
          </p>
        ) : (
          // Show actual trending content once loaded
          <>
            <div className="flex items-center justify-between mb-2 px-2 sm:px-4">
              <motion.h2 variants={itemVariants} className="text-2xl font-bold">
                Trending People
              </motion.h2>
              <motion.div
                variants={itemVariants}
                className="flex gap-1 sm:gap-2">
                <button
                  onClick={() => scrollCarousel("left")}
                  disabled={!canScrollLeft}
                  className={`p-1.5 sm:p-2.5 rounded-md transition-all duration-200 ${
                    canScrollLeft
                      ? "opacity-80 hover:bg-blue-500 hover:scale-105 bg-[rgba(255,255,255,0.1)]"
                      : "opacity-20 cursor-not-allowed"
                  }`}>
                  <LeftIcon />
                </button>
                <button
                  onClick={() => scrollCarousel("right")}
                  disabled={!canScrollRight}
                  className={`p-1.5 sm:p-2.5 rounded-md transition-all duration-200 ${
                    canScrollRight
                      ? "opacity-80 hover:bg-blue-500 hover:scale-105 bg-[rgba(255,255,255,0.1)]"
                      : "opacity-20 cursor-not-allowed"
                  }`}>
                  <RightIcon />
                </button>
              </motion.div>
            </div>
            <div className="relative">
              <div
                ref={carouselRef}
                className="flex gap-4 overflow-x-auto pb-2 px-2 sm:px-4 scroll-smooth scrollbar-hide"
                style={{ minHeight: "300px" }}>
                {" "}
                {/* Ensure enough height for content */}
                {trendingData?.results?.map((person: any) => (
                  <motion.div
                    key={person.id}
                    variants={itemVariants}
                    className="flex-shrink-0"
                    style={{ width: "150px" }}>
                    {" "}
                    {/* Fixed width for consistent card size */}
                    <CastCard
                      id={person.id}
                      name={person.name}
                      profile_path={person.profile_path}
                      character={
                        person.character ||
                        person.known_for_department ||
                        "Actor"
                      }
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      {/* Popular People Section: Conditionally renders skeleton or actual content */}
      <section className="py-4 bg-black flex flex-col items-center justify-center -mt-28 mb-10">
        {popularLoading ? (
          // Show skeleton when popular data is loading
          <PeopleSectionSkeleton
            hasPagination={true}
            titleWidth="w-1/3"
            isCarousel={false}
          />
        ) : popularError ? (
          // Show error message if popular data failed to load
          <p className="text-red-500 px-4">
            Error loading popular people: {popularErrorObj?.message}
          </p>
        ) : (
          // Show actual popular content once loaded
          <>
            <motion.h2
              variants={itemVariants}
              className="text-3xl text-center font-bold mt-2">
              Popular People
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-sm sm:text-base font-light text-center max-w-2xl mb-4">
              Explore some of the most popular stars of film and television.
            </motion.p>

            <div className="flex flex-wrap justify-center gap-4 md:gap-6 md:px-4">
              {popularData?.results?.map((person: any) => (
                <motion.div
                  key={person.id}
                  variants={itemVariants}
                  className="w-[150px]">
                  {" "}
                  {/* Fixed width for consistent card size */}
                  <CastCard
                    id={person.id}
                    name={person.name}
                    profile_path={person.profile_path}
                    character={person.known_for_department || "Actor"}
                  />
                </motion.div>
              ))}
            </div>

            {/* Pagination controls for Popular People */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex items-center justify-center gap-2 mt-4">
              <Link
                to="/people"
                search={(prev) => ({ ...prev, page: page - 1 })}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md transition-all duration-200 ${
                  page === 1
                    ? "opacity-30 cursor-not-allowed" // Disabled state styling
                    : "opacity-80 hover:bg-blue-500 hover:scale-105 " // Active state styling
                }`}
                disabled={page === 1}>
                <LeftIcon /> Prev
              </Link>
              <span className="text-neutral-200 text-sm font-light px-3">
                {page?.toLocaleString()} /{" "}
                {popularData?.total_pages?.toLocaleString() ?? "?"}
              </span>
              <Link
                to="/people"
                search={(prev) => ({ ...prev, page: page + 1 })}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md transition-all duration-200 ${
                  page === popularData?.total_pages
                    ? "opacity-30 cursor-not-allowed" // Disabled state styling
                    : "opacity-80 hover:bg-blue-500 hover:scale-105 " // Active state styling
                }`}
                disabled={page === popularData?.total_pages}>
                Next <RightIcon />
              </Link>
            </motion.div>
            
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}

export default People;
