import { createFileRoute, Link } from "@tanstack/react-router";
import Header from "@/components/Header";
import LinkTo from "@/components/LinkTo";
import { getTrendingMovies } from "@/api/movie";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

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

  const { data, isError, error } = useQuery({
    queryKey: ["trending", period, page],
    queryFn: () => getTrendingMovies(period, page),
    placeholderData: keepPreviousData,
  });

  // console.log(period, data);

  interface MovieProps {
    id: number;
    original_title: string;
    release_date: string;
    poster_path: string;
  }

  if (isError) {
    console.error(error);
  }

  return (
    <div className="w-full mt-[150px] md:mt-[120px] flex flex-col gap-5 lg:px-32 py-4  min-h-10">
      <Header />

      <section className="min-w-[300px]  mt-10 md:mt-0 w-full flex flex-col items-center justify-center gap-4 ">
        <h1 className="text-5xl text-left geist-bold ">Trailer Base</h1>
        <p className="roboto-condensed-light w-[300px] md:w-full text-center">
          Discover the latest trailers for movies and TV shows
        </p>
      </section>
      <br />
      <section className=" min-w-[300px] min-h-[50px] flex items-center justify-center gap-4">
        <LinkTo
          url="/"
          search={{ period: "day", page: 1 }}
          variant={period === "day" ? "primary" : "ghost"}>
          Day
        </LinkTo>
        <LinkTo
          url="/"
          search={{ period: "week", page: 1 }}
          variant={period === "week" ? "primary" : "ghost"}>
          Week
        </LinkTo>
      </section>
      <br />
      <section>
        <div className="absolute left-0 overflow-x-scroll  w-full h-[470px] ">
          <div className="flex animate-scroll gap-12 scale-95">
            {data?.results.map(
              ({
                id,
                original_title,
                release_date,
                poster_path,
              }: MovieProps) => (
                <Link
                  to="/tv"
                  params={{ period: "day", page: 1 }}
                  key={id}
                  className="w-[300px] flex-none h-[450px] rounded-lg shadow-md flex items-center justify-center relative group hover:scale-95 transition-transform duration-300 ease-in-out overflow-hidden stack geist-light hover:ring-1 hover:ring-black hover:rotate-3">
                  <img
                    src={`https://image.tmdb.org/t/p/w440_and_h660_face${poster_path}`}
                    alt={original_title}
                    className="w-full h-full object-cover rounded-lg overflow-hidden"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black   transition-opacity flex flex-col justify-end p-4 rounded-lg">
                    <h3 className="text-white text-lg">{original_title}</h3>
                    <p className="text-white text-sm">{release_date}</p>
                  </div>
                </Link>
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
