import SearchCard from "./SearchCard";
import { useQuery } from "@tanstack/react-query";
import { searchMovies } from "@/api/movie";
import { useState } from "react";
import { useSearchContext } from "@/context/searchContext";

interface SearchCardProps {
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  type: string;
  url: string;
  id: string;
}

const Search = () => {
  const { setStatus } = useSearchContext();
  const [search, setSearch] = useState("");
  const [page] = useState(1);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["search", search, page],
    queryFn: () => searchMovies(page, search),
    enabled: !!search,
  });
  return (
    <section className="fixed w-full h-screen top-0 left-0 inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] backdrop-blur-sm z-20 overflow-hidden" onClick={() => setStatus(false)}>
      <div
        className="bg-[rgba(39,39,39,0.5)] backdrop-blur-sm md:rounded-lg w-full h-full md:w-[516px] md:h-[638px] overflow-auto  text-gray-400"
        onClick={(e) => e.stopPropagation()}>
        <nav className="w-full flex items-center">
          <input
            type="search"
            name="search"
            autoFocus
            id="movie-search-input"
            placeholder="Search for movies, The Godfather, The Dark Knight, etc."
            className="p-2 bg-transparent rounded-t-md text-gray-400 text-md placeholder:text-md placeholder:geist-light backdrop-blur-2xl outline-none active:outline-none  placeholder:text-gray-400 h-[68px] w-full pl-4 md:w-full  focus:ring-white/50 transition duration-300 ease-in-out transform shadow geist-light"
            autoComplete="off"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
          />
        </nav>

        <main>
          <div className="flex flex-col gap-4 ">
            <div className="flex items-center justify-between p-4  mt-4 rounded-t-md">
              <h2 className="text-sm  text-gray-400">Search Results</h2>
              <section className="flex gap-4">
                <button
                  className="hover:font-bold p-2 bg-transparent rounded-t-md text-gray-400 shadow-lg ring-1 px-4 ring-gray-400/50 hover:ring-gray-400/50 transition duration-300 ease-in-out transform"
                  onClick={() => setStatus(false)}>
                  close
                </button>
              </section>
            </div>

            <section className="flex flex-wrap items-start justify-center gap-4 p-4">
              {/* Movie cards will be rendered here */}
              {isLoading && <p className="text-gray-400">Loading...</p>}
              {isError && (
                <p className="text-red-500">Error: {error.message}</p>
              )}
              {data?.results?.length === 0 && (
                <p className="text-gray-400">No results found</p>
              )}
              {search.length === 0 && (
                <p className="text-gray-400">
                  Please search for your preferred movie...
                </p>
              )}
              {data?.results?.map((movie: SearchCardProps) => (
                <SearchCard
                  key={movie.id}
                  title={movie.title}
                  poster_path={movie.poster_path}
                  release_date={movie.release_date}
                  vote_average={movie.vote_average}
                  type="movie"
                  url=""
                  id={movie.id.toString()}
                />
              ))}
              {/* Example cards for testing */}
            </section>
          </div>
        </main>
      </div>
    </section>
  );
}

export default Search