import { createFileRoute, Link } from "@tanstack/react-router";
import Header from "@/components/Header";
import LinkTo from "@/components/LinkTo";
import { getTrendingMovies } from "@/api/movie";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import CardLink from "@/components/CardLink";

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
    <div className="w-full mt-[150px] md:mt-[120px] flex flex-col gap-5 py-4  min-h-10">
      <Header />
      <title>Trailer Base - Trending Movies</title>

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
                  className="stack w-[300px] flex-none h-[450px] rounded-lg shadow-md flex items-center justify-center relative group hover:scale-95 transition-transform duration-300 ease-in-out overflow-hidden  geist-light hover:ring-1 hover:ring-black hover:rotate-3">
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
      <br />
      <br />
      <section className="pt-10 bg-white text-black ring-1 ring-white/20  focus:ring-white/50 transition duration-300 ease-in-out transform hover:scale-105 shadow-md  min-w-[300px]  mt-10 md:mt-0 lg:w-[90%] lg:ml-[5%] flex flex-col items-center justify-center gap-4 rounded-lg">
        <h1 className="text-5xl text-center geist-bold ">Movie Categories</h1>
        <p className="roboto-condensed-light w-[300px] md:w-full text-center">
          Pick a category below and discover the latest movies and their
          trailers!
        </p>

        <div className="w-full min-h-[470px]">
          <div className="flex items-center justify-center flex-wrap animate-scroll gap-12 scale-95">
            <CardLink
              to="/tv"
              params={{ period: "day", page: 1 }}
              imageUrl="https://image.tmdb.org/t/p/w500//9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg"
              title="Top Rated Movies"
              description="Discover the top rated movies of all time."
            />
            <CardLink
              to="/tv"
              params={{ period: "day", page: 1 }}
              imageUrl="https://image.tmdb.org/t/p/w500//yFHHfHcUgGAxziP1C3lLt0q2T4s.jpg"
              title="Popular Movies"
              description="Discover the most popular movies of all time."
            />
            <CardLink
              to="/tv"
              params={{ period: "day", page: 1 }}
              imageUrl="https://image.tmdb.org/t/p/w500//wWba3TaojhK7NdycRhoQpsG0FaH.jpg"
              title="Upcoming Movies"
              description="Discover the upcoming movies on the big screen."
            />

            <CardLink
              to="/tv"
              params={{ period: "day", page: 1 }}
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
