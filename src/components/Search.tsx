import SearchCard from "./SearchCard";
import { useQuery } from "@tanstack/react-query";
import { searchMovies } from "@/api/movie";
import { searchTV } from "@/api/tv";
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

  // Movie search query
  const {
    data: movieData,
    isLoading: movieLoading,
    isError: movieError,
    error: movieErrorMsg,
  } = useQuery({
    queryKey: ["searchMovies", search, page],
    queryFn: () => searchMovies(page, search),
    enabled: !!search,
  });

  // TV search query
  const {
    data: tvData,
    isLoading: tvLoading,
    isError: tvError,
    error: tvErrorMsg,
  } = useQuery({
    queryKey: ["searchTV", search, page],
    queryFn: () => searchTV(page, search),
    enabled: !!search,
  });

  // Combine and normalize results
  const combinedResults = [
    ...(movieData?.results?.map((movie: any) => ({
      id: movie.id.toString(),
      title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      type: "movie",
      url: "",
    })) || []),
    ...(tvData?.results?.map((tv: any) => ({
      id: tv.id.toString(),
      title: tv.name, // TV uses 'name' instead of 'title'
      poster_path: tv.poster_path,
      release_date: tv.first_air_date, // TV uses 'first_air_date'
      vote_average: tv.vote_average,
      type: "tv",
      url: "",
    })) || []),
  ];

  // Determine loading and error states
  const isLoading = movieLoading || tvLoading;
  const isError = movieError || tvError;
  const errorMessage = movieErrorMsg?.message || tvErrorMsg?.message;

  return (
    <section
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.7)] backdrop-blur-md overflow-hidden transition-opacity duration-300"
      onClick={() => setStatus(false)}>
      <div
        className="relative bg-[rgba(20,20,20,0.9)] backdrop-blur-lg md:rounded-xl w-full h-full md:w-[800px] md:h-[700px] max-w-[90vw] max-h-[90vh] overflow-auto text-gray-200 shadow-2xl ring-1 ring-gray-800/50"
        onClick={(e) => e.stopPropagation()}>
        <nav className="w-full flex items-center p-4">
          <input
            type="search"
            name="search"
            autoFocus
            id="search-input"
            placeholder="Search for movies or TV shows, e.g., The Godfather, Breaking Bad"
            className="w-full p-4 bg-[rgba(30,30,30,0.8)] rounded-lg text-gray-200 text-lg placeholder:text-gray-400 placeholder:font-light font-sans outline-none focus:ring-2 focus:ring-[#FACC15] transition-all duration-300 ease-in-out shadow-inner"
            autoComplete="off"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
          />
        </nav>

        <main className="p-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white tracking-wide">
                Search Results
              </h2>
              <button
                className="px-4 py-2 bg-[rgba(50,50,50,0.7)] rounded-lg text-gray-200 font-medium hover:bg-[#FACC15] hover:text-black transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md"
                onClick={() => setStatus(false)}>
                Close
              </button>
            </div>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
              {isLoading && (
                <p className="text-gray-400 text-center col-span-full animate-pulse">
                  Loading...
                </p>
              )}
              {isError && (
                <p className="text-red-400 text-center col-span-full">
                  Error: {errorMessage}
                </p>
              )}
              {combinedResults.length === 0 && search.length > 0 && (
                <p className="text-gray-400 text-center col-span-full">
                  No results found
                </p>
              )}
              {search.length === 0 && (
                <p className="text-gray-400 text-center col-span-full">
                  Search for your favorite movie or TV show...
                </p>
              )}
              {combinedResults.map((item: SearchCardProps) => (
                <div
                  key={`${item.type}-${item.id}`} // Unique key combining type and id
                  className="transform hover:scale-102 transition-transform duration-300">
                  <SearchCard
                    title={item.title}
                    poster_path={item.poster_path}
                    release_date={item.release_date}
                    vote_average={item.vote_average}
                    type={item.type}
                    url=""
                    id={item.id}
                  />
                </div>
              ))}
            </section>
          </div>
        </main>
      </div>
    </section>
  );
};

export default Search;
