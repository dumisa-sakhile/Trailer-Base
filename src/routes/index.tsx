import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getTrendingMovies, getList } from "@/api/movie";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import MediaList from "@/components/MediaList";
import Display from "@/components/Display";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Search as SearchIconLucide } from "lucide-react";

interface pageProps {
  page: number;
  period: string;
}

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, string>): pageProps => ({
    period: search.period ? search.period : "day",
    page: search.page ? parseInt(search.page) : 1,
  }),
  component: App,
});

function App() {
  const { period, page } = Route.useSearch();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");

  // Debounce search input to navigate to /search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput) {
        navigate({
          to: "/search",
          search: { query: searchInput, type: "movies", page: 1 },
        });
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchInput, navigate]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  // Trending Movies Query
  const {
    data: trendingData,
    isLoading: isTrendingLoading,
    isError: isTrendingError,
    error: trendingError,
  } = useQuery({
    queryKey: ["trending", period, page],
    queryFn: () => getTrendingMovies(period, page),
    placeholderData: keepPreviousData,
    staleTime: 60 * 60 * 1000,
  });

  // Popular Movies Query
  const {
    data: popularMovieData,
    isLoading: isPopularMovieLoading,
    isError: isPopularMovieError,
    error: popularMovieError,
  } = useQuery({
    queryKey: ["popularMovies", page],
    queryFn: () => getList(page, "popular"),
    placeholderData: keepPreviousData,
    staleTime: 60 * 60 * 1000,
  });

  // Top Rated Movies Query
  const {
    data: topRatedMovieData,
    isLoading: isTopRatedMovieLoading,
    isError: isTopRatedMovieError,
    error: topRatedMovieError,
  } = useQuery({
    queryKey: ["topRatedMovies", page],
    queryFn: () => getList(page, "top_rated"),
    placeholderData: keepPreviousData,
    staleTime: 60 * 60 * 1000,
  });

  // Upcoming Movies Query
  const {
    data: upcomingMovieData,
    isLoading: isUpcomingMovieLoading,
    isError: isUpcomingMovieError,
    error: upcomingMovieError,
  } = useQuery({
    queryKey: ["upcomingMovies", page],
    queryFn: () => getList(page, "upcoming"),
    placeholderData: keepPreviousData,
    staleTime: 60 * 60 * 1000,
  });

  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
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
    <div className="w-full flex flex-col gap-4 md:gap-6 min-h-screen">
      {/* Mobile-only search section */}
      <section className="md:hidden px-4 pt-6">
        <h1 className="text-3xl text-white text-center font-extrabold tracking-tight mb-4">
          Find Your Next Movie
        </h1>
        <div className="relative">
          <input
            type="search"
            placeholder="Search movies, e.g. Inception"
            value={searchInput}
            onChange={handleSearchChange}
            className="w-full h-12 px-5 py-3 rounded-full bg-[#242424] border border-[#141414] text-base text-white placeholder:text-white pl-12 pr-4 leading-6 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all font-normal shadow-lg"
            aria-label="Search movies"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2">
            <SearchIconLucide size={18} className="text-gray-400" />
          </span>
        </div>
      </section>

      <motion.div
        variants={itemVariants}
        className="relative hidden md:block"
        initial="hidden"
        animate="visible">
        <Display
          data={trendingData}
          isLoading={isTrendingLoading}
          isError={isTrendingError}
          error={trendingError}
          category="movie"
        />
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible">
        <MediaList
          mediaType="movie"
          list="popular"
          title="Popular Movies"
          data={popularMovieData}
          isLoading={isPopularMovieLoading}
          isError={isPopularMovieError}
          error={popularMovieError}
        />
      </motion.div>
      <br />
      <br />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible">
        <MediaList
          mediaType="movie"
          list="top_rated"
          title="Top Rated Movies"
          data={topRatedMovieData}
          isLoading={isTopRatedMovieLoading}
          isError={isTopRatedMovieError}
          error={topRatedMovieError}
        />
      </motion.div>
      <br />
      <br />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible">
        <MediaList
          mediaType="movie"
          list="upcoming"
          title="Upcoming Movies"
          data={upcomingMovieData}
          isLoading={isUpcomingMovieLoading}
          isError={isUpcomingMovieError}
          error={upcomingMovieError}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}>
        <Footer />
      </motion.div>
    </div>
  );
}
