import { createFileRoute } from "@tanstack/react-router";
import Header from "@/components/Header";
import { getTrendingTV, getTVList } from "@/api/tv";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import TvDisplay from "@/components/TvDisplay"; // Replace Display with TvDisplay
import MediaList from "@/components/MediaList";
import Footer from "@/components/Footer";

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
            release_date: tvShow.first_air_date, // Map first_air_date to release_date
          })),
      }
    : undefined;

 

  return (
    <div className="w-full flex flex-col gap-4 md:gap-6 min-h-screen">
      <Header />
      <TvDisplay
        data={mappedTrendingData}
        isLoading={isTrendingLoading}
        isError={isTrendingError}
        error={trendingError}
        category="tv"
      />
      <section className="rounded-md flex flex-col items-center justify-center gap-6 md:px-12 lg:w-[90%] lg:mx-auto">
        <h1 className="text-3xl max-sm:text-2xl lg:text-4xl font-medium tracking-tight text-center">
          Explore TV Shows
        </h1>
        <p className="text-gray-300 font-medium text-center max-w-md">
          Discover the best in TV shows, curated for you.
        </p>
      </section>

      <MediaList
        mediaType="tv"
        list="popular"
        title="Popular TV Shows"
        data={popularTVData}
        isLoading={isPopularTVLoading}
        isError={isPopularTVError}
        error={popularTVError}
      />
      <br />
      <br />
      <MediaList
        mediaType="tv"
        list="top_rated"
        title="Top Rated TV Shows"
        data={topRatedTVData}
        isLoading={isTopRatedTVLoading}
        isError={isTopRatedTVError}
        error={topRatedTVError}
      />

      <Footer />
    </div>
  );
}
