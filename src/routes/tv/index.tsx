import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getTrendingTV, getTVList } from "@/api/tv";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import TvDisplay from "@/components/TvDisplay";
import MediaList from "@/components/MediaList";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Search as SearchIconLucide } from "lucide-react";


export const Route = createFileRoute("/tv/")({
  component: App,
});

function App() {
  const page = 1;
  const period: 'day' | 'week' = "day";
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");

  // Debounce search input to navigate to /search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput) {
        navigate({
          to: "/search",
          search: { query: searchInput, type: "tv", page: 1 },
        });
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchInput, navigate]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

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
      transition: { duration: 0.6 },
    },
  };

  return (
    <div className="w-full flex flex-col gap-4 md:gap-6 min-h-screen poppins-light">
      <title>TrailerBase - TV Shows</title>
      {/* Mobile-only search section */}
      <section className="md:hidden px-4 pt-6">
        <h1 className="text-3xl text-white text-center font-extrabold tracking-tight mb-4">
          Find Your Next TV Show
        </h1>
        <div className="relative">
          <input
            type="search"
            placeholder="Search TV shows, e.g. The Chosen"
            value={searchInput}
            onChange={handleSearchChange}
            className="w-full h-12 px-5 py-3 rounded-full bg-[#242424] border border-[#141414] text-base text-white placeholder:text-white pl-12 pr-4 leading-6 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all font-normal shadow-lg"
            aria-label="Search TV shows"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2">
            <SearchIconLucide size={18} className="text-gray-400" />
          </span>
        </div>
      </section>

      <motion.div
        variants={itemVariants}
        className="hidden md:block"
        initial="hidden"
        animate="visible">
        <TvDisplay
          data={mappedTrendingData}
          isLoading={isTrendingLoading}
          isError={isTrendingError}
          error={trendingError}
          category="tv"
        />
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible">
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
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible">
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
