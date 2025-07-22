import { createFileRoute } from "@tanstack/react-router";
import { getTrendingTV, getTVList } from "@/api/tv";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import TvDisplay from "@/components/TvDisplay";
import MediaList from "@/components/MediaList";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

interface PageProps {
  page: number;
  period: string;
}

export const Route = createFileRoute("/tv/")({
  validateSearch: (search: Record<string, string>): PageProps => ({
    period: search.period ? search.period : "day",
    page: search.page ? parseInt(search.page) : 1,
  }),
  component: App,
});

function App() {
  const { period, page } = Route.useSearch();

  // Trending TV Shows Query
  const {
    data: trendingData,
    isLoading: isTrendingLoading,
    isError: isTrendingError,
    error: trendingError,
  } = useQuery({
    queryKey: ["trendingTV", period, page],
    queryFn: async () => {
      const data = await getTrendingTV(period, page);
      return data;
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 60 * 1000,
  });

  // Popular TV Shows Query
  const {
    data: popularTVData,
    isLoading: isPopularTVLoading,
    isError: isPopularTVError,
    error: popularTVError,
  } = useQuery({
    queryKey: ["popularTV", page],
    queryFn: () => getTVList(page, "popular"),
    placeholderData: keepPreviousData,
    staleTime: 60 * 60 * 1000,
  });

  // Top Rated TV Shows Query
  const {
    data: topRatedTVData,
    isLoading: isTopRatedTVLoading,
    isError: isTopRatedTVError,
    error: topRatedTVError,
  } = useQuery({
    queryKey: ["topRatedTV", page],
    queryFn: () => getTVList(page, "top_rated"),
    placeholderData: keepPreviousData,
    staleTime: 60 * 60 * 1000,
  });

  // Define a stricter type for TV show items
  type TVShow = {
    id: number;
    name: string;
    first_air_date: string;
    poster_path: string;
    vote_average: number;
    backdrop_path?: string;
    overview?: string;
    genre_ids?: number[];
  };

  // Map the data for TvDisplay
  const mappedTrendingData = trendingData
    ? {
        ...trendingData,
        results: trendingData.results
          .filter(
            (tvShow: TVShow) => Number.isInteger(tvShow.id) && tvShow.id > 0
          )
          .map((tvShow: TVShow) => ({
            ...tvShow,
            title: tvShow.name,
            release_date: tvShow.first_air_date,
          })),
      }
    : undefined;

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
        className="hidden md:block"
        initial="hidden"
        animate="visible" // Changed from whileInView
      >
        <TvDisplay
          data={mappedTrendingData}
          isLoading={isTrendingLoading}
          isError={isTrendingError}
          error={trendingError}
          category="tv"
        />
      </motion.div>

      {/* Changed whileInView to animate for immediate animation on render */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible" // Changed from whileInView
      >
        <MediaList
          mediaType="tv"
          list="popular"
          title="Popular TV Shows"
          data={popularTVData}
          isLoading={isPopularTVLoading}
          isError={isPopularTVError}
          error={popularTVError}
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
          mediaType="tv"
          list="top_rated"
          title="Top Rated TV Shows"
          data={topRatedTVData}
          isLoading={isTopRatedTVLoading}
          isError={isTopRatedTVError}
          error={topRatedTVError}
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
