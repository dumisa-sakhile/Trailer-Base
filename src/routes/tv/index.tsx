import { createFileRoute, Link } from "@tanstack/react-router";
import Header from "@/components/Header";
import { getTrendingTV } from "@/api/tv";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import TvDisplayCard from "@/components/TvDisplayCard"; // Updated to use TvDisplayCard


interface pageProps {
  page: number;
  period: string;
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
      title: tv.name, // Map 'name' to 'title'
    })),
  };
};

function App() {
  const { period, page } = Route.useSearch();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["trendingTV", period, page],
    queryFn: () => getTrendingTV(period, page),
    placeholderData: keepPreviousData,
    select: normalizeTVData, // Transform data to map 'name' to 'title'
  });

  return (
    <div className="w-full mt-[150px] md:mt-[120px] flex flex-col gap-6 py-6 min-h-10 ">
      <Header />
      <title>Trailer Base - TV Shows</title>

      <section className="min-w-[300px] mt-10 md:mt-0 w-full flex flex-col items-start justify-center gap-4 px-6 md:px-12">
        <p className="text-lg text-gray-300 font-light w-full text-center">
          These are the trending TV shows of the{" "}
          <span className="font-bold uppercase text-white">{period}</span>.
        </p>
      </section>
      <br />
      {/* Period Buttons */}
      <section className="min-w-[300px] min-h-[50px] flex items-center justify-center gap-4">
        <Link
          to="/tv"
          search={{ period: "day", page: 1 }}
          className={`px-6 py-2 rounded-full font-semibold text-lg roboto-condensed-bold transition-all duration-300 ${
            period === "day"
              ? "bg-[#222222] text-white shadow-lg hover:bg-[#333333] ring-2 ring-[#444444]"
              : "bg-transparent text-gray-200 border border-[#333333] hover:bg-[#333333] hover:text-white"
          }`}>
          Day
        </Link>
        <Link
          to="/tv"
          search={{ period: "week", page: 1 }}
          className={`px-6 py-2 rounded-full font-semibold text-lg roboto-condensed-bold transition-all duration-300 ${
            period === "week"
              ? "bg-[#222222] text-white shadow-lg hover:bg-[#333333] ring-2 ring-[#444444]"
              : "bg-transparent text-gray-200 border border-[#333333] hover:bg-[#333333] hover:text-white"
          }`}>
          Week
        </Link>
      </section>
      <br />
      <TvDisplayCard
        data={data}
        isLoading={isLoading}
        isError={isError}
        error={error}
        list="popular"
        listName="All Trending TV Shows"
        listLink="/tv/list/popular"
        category="tv"
      />
      <br />
      <br />
    </div>
  );
}
