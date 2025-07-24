import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getTrendingPeople, getPopularPeople } from "@/api/people";
import { useSearchContext } from "@/context/searchContext";
import { useEffect, useRef, useState } from "react";
import CastCard from "@/components/PeopleCastCard";
import Loading from "@/components/Loading";
import Footer from "@/components/Footer";
import { LeftIcon, RightIcon } from "@/components/icons/Icons";
import { motion } from "framer-motion";
import { Search as SearchIconLucide } from "lucide-react";

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
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");

  // Debounce search input to navigate to /search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput) {
        navigate({
          to: "/search",
          search: { query: searchInput, type: "people", page: 1 },
        });
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchInput, navigate]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

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
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    updateScrollState();
    carousel.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);

    return () => {
      carousel.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [trendingData]);

  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;

    const { scrollLeft, clientWidth } = carouselRef.current;
    const scrollAmount = clientWidth * 0.8;

    carouselRef.current.scrollTo({
      left:
        direction === "right"
          ? scrollLeft + scrollAmount
          : scrollLeft - scrollAmount,
      behavior: "smooth",
    });
  };

  // Animation variants
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
    <div className="w-full md:pt-16 flex flex-col bg-gradient-to-br from-gray-950 to-black text-white">
      <title>Trailer Base - People</title>

      {/* Mobile-only search section */}
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
            <SearchIconLucide size={18} className="text-gray-400" />
          </span>
        </div>
      </section>

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
          className={`px-4 py-2 rounded-full transition-all duration-200 ${
            period === "day"
              ? "bg-[#333]/50 ring-1 ring-white/10"
              : "opacity-30 hover:opacity-80 hover:bg-blue-900/20 hover:scale-105 ring-1 ring-blue-400/10"
          }`}>
          Day
        </motion.button>
        <motion.button
          variants={itemVariants}
          onClick={() => setPeriod("week")}
          className={`px-4 py-2 rounded-full transition-all duration-200 ${
            period === "week"
              ? "bg-[#333]/50 ring-1 ring-white/10"
              : "opacity-30 hover:opacity-80 hover:bg-blue-900/20 hover:scale-105 ring-1 ring-blue-400/10"
          }`}>
          Week
        </motion.button>
      </motion.section>

      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-[98vw] py-2">
        <div className="flex items-center justify-between mb-2 px-2 sm:px-4">
          <motion.h2 variants={itemVariants} className="text-2xl font-bold">
            Trending People
          </motion.h2>
          <motion.div variants={itemVariants} className="flex gap-1 sm:gap-2">
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

        {trendingLoading ? (
          <Loading />
        ) : trendingError ? (
          <p className="text-center text-red-500">
            Error loading trending people: {trendingErrorObj?.message}
          </p>
        ) : (
          <div className="relative">
            <div
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto pb-2 px-2 sm:px-4 scroll-smooth scrollbar-hide"
              style={{ minHeight: "300px" }}>
              {trendingData?.results?.map((person: any) => (
                <motion.div
                  key={person.id}
                  variants={itemVariants}
                  className="flex-shrink-0"
                  style={{ width: "150px" }}>
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
            </div>
          </div>
        )}
      </motion.section>

      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="py-4 bg-black flex flex-col items-center justify-center -mt-28">
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
          {popularLoading ? (
            <Loading />
          ) : popularError ? (
            <p className="text-red-500">
              Error loading popular people: {popularErrorObj?.message}
            </p>
          ) : (
            popularData?.results?.map((person: any) => (
              <motion.div
                key={person.id}
                variants={itemVariants}
                className="w-[150px]">
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

        {!popularLoading && !popularError && (
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
                  ? "opacity-30 cursor-not-allowed"
                  : "opacity-80 hover:bg-blue-500 hover:scale-105 "
              }`}
              disabled={page === 1}>
              <LeftIcon /> Prev
            </Link>
            <span className="text-gray-200 text-sm font-light px-3">
              {page?.toLocaleString()} /{" "}
              {popularData?.total_pages?.toLocaleString() ?? "?"}
            </span>
            <Link
              to="/people"
              search={(prev) => ({ ...prev, page: page + 1 })}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md transition-all duration-200 ${
                page === popularData?.total_pages
                  ? "opacity-30 cursor-not-allowed"
                  : "opacity-80 hover:bg-blue-500 hover:scale-105 "
              }`}
              disabled={page === popularData?.total_pages}>
              Next <RightIcon />
            </Link>
          </motion.div>
        )}
      </motion.section>

      <Footer />
    </div>
  );
}

export default People;
