import { createFileRoute, Link } from "@tanstack/react-router";
import Header from "@/components/Header";
import LinkTo from "@/components/LinkTo";
import { getTrendingMovies } from "@/api/movie";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import CardLink from "@/components/CardLink";
import Loading from "@/components/Loading";


interface pageProps {
  page: number;
  period: string;
}

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, string>): pageProps => ({
    period: search.period ? search.period : "day",
    page: search.page ? parseInt(search.page) : 1,
  }),

  component: App
});

function App() {
  const { period, page } = Route.useSearch();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["trending", period, page],
    queryFn: () => getTrendingMovies(period, page),
    placeholderData: keepPreviousData,
  });

  // console.log(period, data);

  interface MovieProps {
    id: number;
    title: string;
    release_date: string;
    poster_path: string;
    vote_average: number;
    total_pages: number;
  }


  return (
    <div className="w-full mt-[150px] md:mt-[120px] flex flex-col gap-5 py-4  min-h-10">
      <Header />
      <title>Trailer Base - Movies</title>

      <section className="min-w-[300px]  mt-10 md:mt-0 w-full flex flex-col items-center justify-center gap-4 ">
        <h1 className="text-5xl text-left geist-bold ">Trailer Base</h1>
        <p className="roboto-condensed-light w-[300px] md:w-full text-center">
          Welcome to Trailer Base, where you can find the latest trailers .These
          are the trending movies of the{" "}
          <span className="font-bold uppercase">{period}</span>.
        </p>
      </section>
      <br />
      {/* period */}
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
        <div className="overflow-x-scroll  w-full h-[470px]">
          <div className="flex animate-scroll gap-12 scale-95">
            {isLoading && <Loading/>}
            {isError && <p className="text-red-500">Error: {error.message}</p>}

            {data?.results.map(
              ({
                id,
                title,
                release_date,
                poster_path,
                vote_average,
              }: MovieProps) => (
                <Link
                  // search={{ title: title }}
                  to="/movie/$movieId"
                  params={{ movieId: id.toString() }}
                  key={id}
                  className="stack w-[300px] flex-none h-[450px] rounded-lg shadow-md flex items-center justify-center relative group hover:scale-95 transition-transform duration-300 ease-in-out overflow-hidden  geist-light hover:ring-1 hover:ring-black hover:rotate-3">
                  <img
                    src={`https://image.tmdb.org/t/p/w440_and_h660_face${poster_path}`}
                    alt={title}
                    className="w-full h-full object-cover rounded-lg overflow-hidden"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black   transition-opacity flex flex-col justify-end p-4 rounded-lg">
                    <p className="text-yellow-500 text-sm">{vote_average}</p>
                    <p className="text-white text-sm">{release_date}</p>
                    <h3 className="text-white text-lg">{title}</h3>
                  </div>
                </Link>
              )
            )}
          </div>
        </div>
      </section>
      <br />
      <br />
      <section className="pt-10 pb-10 bg-white text-black ring-1 ring-white/20  focus:ring-white/50 transition duration-300 ease-in-out transform hover:scale-105 shadow-md  min-w-[300px]  mt-10 md:mt-0 lg:w-[90%] lg:ml-[5%] flex flex-col items-center justify-center gap-4 rounded-lg">
        <h1 className="text-5xl text-center geist-bold ">Movie Lists</h1>
        <p className="roboto-condensed-light w-[300px] md:w-full text-center">
          Pick a list below and explore the world of movies.        </p>

        <div className="w-full min-h-[470px]">
          <div className="flex items-center justify-center flex-wrap animate-scroll gap-12 scale-95">
            <CardLink
              to="/movie/list/top_rated"
              params={{list  : "top_rated"}}
              imageUrl="https://image.tmdb.org/t/p/w500//9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg"
              title="Top Rated Movies"
              description="Discover the top rated movies of all time."
            />
            <CardLink
              to="/movie/list/popular"
              params={{list  : "popular"}}
              imageUrl="https://image.tmdb.org/t/p/w500//yFHHfHcUgGAxziP1C3lLt0q2T4s.jpg"
              title="Popular Movies"
              description="Discover the most popular movies of all time."
            />
            <CardLink
              to="/movie/list/upcoming"
              params={{list  : "upcoming"}}
              imageUrl="https://image.tmdb.org/t/p/w500//wWba3TaojhK7NdycRhoQpsG0FaH.jpg"
              title="Upcoming Movies"
              description="Discover the upcoming movies on the big screen."
            />

            <CardLink
              to="/movie/list/now_playing"
              params={{list  : "now_playing"}}
              imageUrl="https://image.tmdb.org/t/p/w500//oLxWocqheC8XbXbxqJ3x422j9PW.jpg"
              title="Now Playing Movies"
              description="Discover the movies that are currently playing in theaters."
            />
          </div>
        </div>
      </section>
    </div>
  );
}
