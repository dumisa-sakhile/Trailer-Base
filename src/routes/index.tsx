import { createFileRoute } from "@tanstack/react-router";
import Header from "@/components/Header";
import { getTrendingMovies, getList } from "@/api/movie";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import MediaList from "@/components/MediaList"; // Adjust import path as needed
import Display from "@/components/Display";
import Footer from "@/components/Footer";

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

  return (
    <div className="w-full flex flex-col gap-4 md:gap-6 min-h-screen">
      <Header />
      <Display
        data={trendingData}
        isLoading={isTrendingLoading}
        isError={isTrendingError}
        error={trendingError}
        category="movie"
      />
      <section className=" rounded-md flex flex-col items-center justify-center gap-6 md:px-12 lg:w-[90%] lg:mx-auto">
        <h1 className="text-3xl max-sm:text-2xl lg:text-4xl font-medium tracking-tight text-center">
          Explore Movies
        </h1>
        <p className="text-gray-300 font-medium text-center max-w-md">
          Discover the best in movies, curated for you.
        </p>
      </section>

      <MediaList
        mediaType="movie"
        list="popular"
        title="Popular Movies"
        data={popularMovieData}
        isLoading={isPopularMovieLoading}
        isError={isPopularMovieError}
        error={popularMovieError}
      />
      <br />
      <br />
      <MediaList
        mediaType="movie"
        list="top_rated"
        title="Top Rated Movies"
        data={topRatedMovieData}
        isLoading={isTopRatedMovieLoading}
        isError={isTopRatedMovieError}
        error={topRatedMovieError}
      />
      <br />
      <br />
      <MediaList
        mediaType="movie"
        list="upcoming"
        title="Upcoming Movies"
        data={upcomingMovieData}
        isLoading={isUpcomingMovieLoading}
        isError={isUpcomingMovieError}
        error={upcomingMovieError}
      />

      <Footer />
    </div>
  );
}
