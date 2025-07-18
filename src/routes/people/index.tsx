import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getTrendingPeople, getPopularPeople } from "@/api/people";
import { useSearchContext } from "@/context/searchContext";
import { useEffect, useRef, useState } from "react";
import CastCard from "@/components/PeopleCastCard";
import Loading from "@/components/Loading";
import Footer from "@/components/Footer";
import { LeftIcon, RightIcon } from "@/components/icons/Icons";
import { motion } from "framer-motion";

interface pageProps {
  page?: number;
}

export const Route = createFileRoute("/people/")({
  validateSearch: (search: Record<string, string>): pageProps => ({
    page: search.page ? parseInt(search.page) : 1,
  }),
  component: People,
});

function People() {
  const search = Route.useSearch();
  const { page = 1 } = search;
  const { setStatus } = useSearchContext();

  const trendingPage = 1;
  const [period, setPeriod] = useState("day");

  // Trending People Query
  const {
    data: trendingData,
    isLoading: trendingLoading,
    isError: trendingError,
    error: trendingErrorObj,
  } = useQuery({
    queryKey: ["trendingPeople", period, trendingPage],
    queryFn: () => getTrendingPeople(period, trendingPage),
    placeholderData: keepPreviousData,
    staleTime: 60 * 60 * 1000,
  });

  // Popular People Query
  const {
    data: popularData,
    isLoading: popularLoading,
    isError: popularError,
    error: popularErrorObj,
  } = useQuery({
    queryKey: ["popularPeople", page],
    queryFn: () => getPopularPeople(page),
    placeholderData: keepPreviousData,
    staleTime: 60 * 60 * 1000,
  });

  useEffect(() => {
    setStatus(false);
  }, [setStatus]);

  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    if (!carouselRef.current) {
      return;
    }
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    const epsilon = 1; // Small margin for floating-point precision
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth + epsilon < scrollWidth);
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      // Initial state update
      updateScrollState();
      // Handle scroll events
      const handleScroll = () => updateScrollState();
      carousel.addEventListener("scroll", handleScroll);
      // Handle window resize
      window.addEventListener("resize", updateScrollState);
      // Update state when trending data loads
      if (!trendingLoading && trendingData) {
        updateScrollState();
      }
      return () => {
        carousel.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", updateScrollState);
      };
    }
  }, [trendingLoading, trendingData]);

  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) {
      return;
    }

    const { scrollLeft, clientWidth, scrollWidth } = carouselRef.current;
    // Fallback to clientWidth if card width isn't available
    const cardWidth =
      carouselRef.current.querySelector(".snap-start")?.clientWidth ||
      clientWidth / 2;
    const scrollAmount = cardWidth * 2; // Scroll by two cards

    let newScroll: number;
    if (direction === "right") {
      newScroll = Math.min(
        scrollLeft + scrollAmount,
        scrollWidth - clientWidth
      );
    } else {
      newScroll = Math.max(scrollLeft - scrollAmount, 0);
    }

    carouselRef.current.scrollTo({
      left: newScroll,
      behavior: "smooth",
    });
  };

  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="w-full pt-24 md:pt-16 flex flex-col gap-4 bg-gradient-to-br from-gray-950 to-black text-white">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}>
      </motion.div>
      <title>Trailer Base - People</title>

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

      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-center gap-2 py-2">
        <motion.button
          variants={itemVariants}
          onClick={() => setPeriod("day")}
          className={`button-style px-4 py-2 rounded-full transition-all duration-200 ${
            period === "day"
              ? "bg-[#333]/50 ring-1 ring-white/10"
              : "opacity-30 hover:opacity-80 hover:bg-blue-900/20 hover:scale-105 ring-1 ring-blue-400/10"
          }`}
          aria-label="View daily trending people">
          Day
        </motion.button>
        <motion.button
          variants={itemVariants}
          onClick={() => setPeriod("week")}
          className={`button-style px-4 py-2 rounded-full transition-all duration-200 ${
            period === "week"
              ? "bg-[#333]/50 ring-1 ring-white/10"
              : "opacity-30 hover:opacity-80 hover:bg-blue-900/20 hover:scale-105 ring-1 ring-blue-400/10"
          }`}
          aria-label="View weekly trending people">
          Week
        </motion.button>
      </motion.section>

      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-[98vw] overflow-x-hidden py-4">
        <div className="flex items-center justify-between mb-4 px-2 sm:px-4">
          <motion.h2 variants={itemVariants} className="text-2xl font-bold">
            Trending People
          </motion.h2>
          <motion.div variants={itemVariants} className="flex gap-1 sm:gap-2">
            <button
              onClick={() => scrollCarousel("left")}
              aria-label="Scroll left"
              disabled={!canScrollLeft}
              className={`bg-[rgba(255,255,255,0.1)] rounded-md p-1.5 sm:p-2.5 transition-all duration-200 ring-1 ring-blue-400/10 ${
                canScrollLeft
                  ? "opacity-80 hover:bg-blue-500 hover:scale-105"
                  : "opacity-20 cursor-not-allowed"
              }`}>
              <LeftIcon />
            </button>
            <button
              onClick={() => scrollCarousel("right")}
              aria-label="Scroll right"
              disabled={!canScrollRight}
              className={`bg-[rgba(255,255,255,0.1)] rounded-md p-1.5 sm:p-2.5 transition-all duration-200 ring-1 ring-blue-400/10 ${
                canScrollRight
                  ? "opacity-80 hover:bg-blue-500 hover:scale-105"
                  : "opacity-20 cursor-not-allowed"
              }`}>
              <RightIcon />
            </button>
          </motion.div>
        </div>
        {trendingLoading ? (
          <motion.div variants={itemVariants}>
            <Loading />
          </motion.div>
        ) : trendingError ? (
          <motion.p
            variants={itemVariants}
            className="text-center text-red-500">
            Error loading trending people: {trendingErrorObj?.message}
          </motion.p>
        ) : (
          <motion.div
            ref={carouselRef}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex gap-2 sm:gap-3 overflow-x-auto pb-4 px-2 sm:px-4 snap-x snap-mandatory scroll-smooth scrollbar-hide"
            style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x" }}>
            {trendingData?.results?.map((person: any) => (
              <motion.div
                key={person.id}
                variants={itemVariants}
                className="snap-start flex-shrink-0">
                <CastCard
                  id={person.id}
                  name={person.name}
                  profile_path={person.profile_path}
                  character={
                    person.character || person.known_for_department || "Actor"
                  }
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.section>

      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="py-6 bg-black flex flex-col items-center justify-center gap-4">
        <motion.h2
          variants={itemVariants}
          className="text-3xl text-center font-bold">
          Popular People
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="text-sm sm:text-base font-light text-center max-w-2xl">
          Explore some of the most popular stars of film and television.
        </motion.p>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full">
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 px-4">
            {popularLoading || popularError ? (
              <motion.p variants={itemVariants} className="text-gray-400">
                {popularLoading ? (
                  <span>Loading popular people...</span>
                ) : (
                  `Failed to load popular people: ${popularErrorObj?.message}`
                )}
              </motion.p>
            ) : (
              popularData?.results?.map((person: any) => (
                <motion.div key={person.id} variants={itemVariants}>
                  <CastCard
                    id={person.id}
                    name={person.name}
                    profile_path={person.profile_path}
                    character={person.known_for_department || "Actor"}
                  />
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
        {!popularLoading && !popularError && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex items-center justify-center gap-2 mt-4">
            <Link
              to="/people"
              search={(prev) => ({
                ...prev,
                page: page - 1,
              })}
              className={`flex items-center gap-1.5 bg-[rgba(255,255,255,0.1)] rounded-md px-4 py-2 text-sm font-semibold uppercase transition-all duration-200 ring-1 ring-blue-400/10 ${
                page === 1
                  ? "opacity-30 cursor-not-allowed"
                  : "opacity-80 hover:bg-blue-500 hover:scale-105"
              }`}
              disabled={page === 1}
              aria-label="Go to previous popular page">
              <LeftIcon />
              Prev
            </Link>
            <motion.span
              variants={itemVariants}
              className="text-gray-200 text-sm font-light px-3">
              {page?.toLocaleString()} /{" "}
              {popularData?.total_pages?.toLocaleString() ?? "?"}
            </motion.span>
            <Link
              to="/people"
              search={(prev) => ({
                ...prev,
                page: page + 1,
              })}
              className={`flex items-center gap-1.5 bg-[rgba(255,255,255,0.1)] rounded-md px-4 py-2 text-sm font-semibold uppercase transition-all duration-200 ring-1 ring-blue-400/10 ${
                popularData?.total_pages === page
                  ? "opacity-30 cursor-not-allowed"
                  : "opacity-80 hover:bg-blue-500 hover:scale-105"
              }`}
              disabled={popularData?.total_pages === page}
              aria-label="Go to next popular page">
              Next
              <RightIcon />
            </Link>
          </motion.div>
        )}
      </motion.section>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}>
        {!trendingLoading && !popularLoading && <Footer />}
      </motion.div>
    </div>
  );
}

export default People;
