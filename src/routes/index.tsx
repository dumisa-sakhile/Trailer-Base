import { createFileRoute } from "@tanstack/react-router";
import { getTrendingMovies, getList } from "@/api/movie";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import MediaList from "@/components/MediaList";
import Display from "@/components/Display";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

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
    <div className="w-full flex flex-col gap-4 md:gap-6 min-h-screen ">
      {/* This motion.div was empty and can be removed or repurposed if it's meant to animate the whole page entrance */}
      {/* <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}>
      </motion.div> */}

      {/* Changed whileInView to animate for immediate animation on render */}
      <motion.div
        variants={itemVariants}
        className="relative hidden md:block"
        initial="hidden"
        animate="visible" // Changed from whileInView
      >
        <Display
          data={trendingData}
          isLoading={isTrendingLoading}
          isError={isTrendingError}
          error={trendingError}
          category="movie"
        />
      </motion.div>

      {/* Changed whileInView to animate for immediate animation on render */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible" // Changed from whileInView
      >
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
      {/* Changed whileInView to animate for immediate animation on render */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible" // Changed from whileInView
      >
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
      {/* Changed whileInView to animate for immediate animation on render */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible" // Changed from whileInView
      >
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
