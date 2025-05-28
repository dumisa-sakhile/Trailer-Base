import { createFileRoute, Link } from "@tanstack/react-router";
import Header from "@/components/Header";
import { getTrendingTV, getTVList } from "@/api/tv";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import TvDisplay from "@/components/TvDisplay";
import MediaCard from "@/components/MediaCard";
import LinkTo from "@/components/LinkTo";
import Button from "@/components/Button";
import Loading from "@/components/Loading";

interface pageProps {
  page: number;
  period: string;
}

interface TVProps {
  id: number;
  name: string;
  first_air_date: string;
  poster_path: string | null;
  vote_average: number;
}

export const Route = createFileRoute("/tv/")({
  validateSearch: (search: Record<string, string>): pageProps => ({
    period: search.period ? search.period : "day",
    page: search.page ? parseInt(search.page) : 1,
  }),
  component: App,
});

// Utility function to transform TV data
const normalizeTVData = (data: any) => {
  if (!data || !data.results) return data;
  return {
    ...data,
    results: data.results.map((tv: any) => ({
      ...tv,
      title: tv.name, // Map 'name' to 'title' for MediaCard
    })),
  };
};

function App() {
  const { period, page } = Route.useSearch();

  // Query for trending TV shows
  const {
    data: trendingData,
    isLoading: isTrendingLoading,
    isError: isTrendingError,
    error: trendingError,
  } = useQuery({
    queryKey: ["trendingTV", period, page],
    queryFn: () => getTrendingTV(period, page),
    placeholderData: keepPreviousData,
    select: normalizeTVData,
  });

  // Query for popular TV shows (page 1)
  const {
    data: popularData,
    isLoading: isPopularLoading,
    isError: isPopularError,
    error: popularError,
  } = useQuery({
    queryKey: ["tv", "popular", 1],
    queryFn: () => getTVList(1, "popular"),
    select: normalizeTVData,
  });

  // Query for top-rated TV shows (page 1)
  const {
    data: topRatedData,
    isLoading: isTopRatedLoading,
    isError: isTopRatedError,
    error: topRatedError,
  } = useQuery({
    queryKey: ["tv", "top_rated", 1],
    queryFn: () => getTVList(1, "top_rated"),
    select: normalizeTVData,
  });

  return (
    <div className="w-full mt-[100px] md:mt-[120px] flex flex-col gap md:gap-5  min-h-10">
      <Header />
      <title>Trailer Base - TV Shows</title>

      {/* Trending Section */}
      <section className="min-w-[300px] mt-10 md:mt-0 w-full flex flex-col items-start justify-center gap-4 px-6 md:px-12">
        <h1 className="w-full text-5xl max-sm:text-3xl text-center geist-bold">
          Trailer Base - TV Shows
        </h1>
        <p className="roboto-condensed-light w-[300px] md:w-full text-center">
          These are the trending TV shows of the{" "}
          <span className="font-bold uppercase text-white">{period}</span>.
        </p>
      </section>
      <br />
      {/* Period Selection */}
      <section className="min-w-[300px] min-h-[50px] flex items-center justify-center gap-4">
        <LinkTo
          url="/tv"
          search={{ period: "day", page: 1 }}
          variant={period === "day" ? "primary" : "ghost"}
          className="text-lg max-sm:text-sm">
          Day
        </LinkTo>
        <LinkTo
          url="/tv"
          search={{ period: "week", page: 1 }}
          variant={period === "week" ? "primary" : "ghost"}
          className="text-lg max-sm:text-sm">
          Week
        </LinkTo>
      </section>
      <br />
      <TvDisplay
        data={trendingData}
        isLoading={isTrendingLoading}
        isError={isTrendingError}
        error={trendingError}
        category="tv"
      />
      <br />
      <br />

      {/* Popular TV Shows Section */}
      <section className="w-full flex flex-col items-start justify-center gap-4 md:px-12">
        <h2 className="text-2xl max-sm:text-xl lg:text-5xl max-sm:lg:text-3xl text-white font-bold capitalize">
          Popular TV Shows
        </h2>
        <br />
        {isPopularLoading && (
          <div>
            <Loading />
          </div>
        )}
        {isPopularError && <div>Error: {popularError?.message}</div>}
        <div className="w-full flex flex-wrap items-start justify-center gap-2 lg:gap-10 ">
          {popularData?.results?.map(
            ({
              id,
              title,
              first_air_date,
              poster_path,
              vote_average,
            }: TVProps & { title: string }) => (
              <MediaCard
                key={id}
                id={id}
                title={title}
                release_date={first_air_date}
                poster_path={poster_path}
                vote_average={vote_average}
                type="tv"
              />
            )
          )}
        </div>
        <br />
        <Link
          to="/tv/list/$list"
          params={{ list: "popular" }}
          search={{ page: 1 }}
          className="mt-4">
          <Button variant="ghost">View All Popular TV Shows</Button>
        </Link>
      </section>
      <br />
      <br />

      {/* Top Rated TV Shows Section */}
      <section className="min-w-[300px] w-full flex flex-col items-start justify-center gap-4  md:px-12">
        <h2 className="text-2xl max-sm:text-xl lg:text-5xl max-sm:lg:text-3xl text-white font-bold capitalize">
          Top Rated TV Shows
        </h2>
        <br />
        {isTopRatedLoading && (
          <div>
            <Loading />
          </div>
        )}
        {isTopRatedError && <div>Error: {topRatedError?.message}</div>}
        <div className="w-full flex flex-wrap items-start justify-center gap-2 lg:gap-10">
          {topRatedData?.results?.map(
            ({
              id,
              title,
              first_air_date,
              poster_path,
              vote_average,
            }: TVProps & { title: string }) => (
              <MediaCard
                key={id}
                id={id}
                title={title}
                release_date={first_air_date}
                poster_path={poster_path}
                vote_average={vote_average}
                type="tv"
              />
            )
          )}
        </div>
        <br />
        <Link
          to="/tv/list/$list"
          params={{ list: "top_rated" }}
          search={{ page: 1 }}>
          <Button variant="ghost">View All Top Rated TV Shows</Button>
        </Link>
      </section>
      <br />
      <br />
    </div>
  );
}
