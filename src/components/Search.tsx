import { createPortal } from "react-dom";
import SearchCard from "./SearchCard";
import { useQuery } from "@tanstack/react-query";
import { searchMovies } from "@/api/movie";
import { searchTV } from "@/api/tv";
import { searchPerson } from "@/api/people";
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
  const { status, setStatus, pageType } = useSearchContext();
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
    enabled: !!search && pageType === "movies",
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
    enabled: !!search && pageType === "tv",
  });

  // Person search query
  const {
    data: personData,
    isLoading: personLoading,
    isError: personError,
    error: personErrorMsg,
  } = useQuery({
    queryKey: ["searchPerson", search, page],
    queryFn: () => searchPerson(page, search),
    enabled: !!search && pageType === "people",
  });

  // Normalize and filter results based on pageType
  const results = (() => {
    if (pageType === "movies") {
      return (
        movieData?.results
          ?.filter((movie: any) => movie?.poster_path) // Filter out items without poster_path
          .map((movie: any) => ({
            id: movie?.id?.toString() ?? "", // Fallback to empty string if id is missing
            title: movie?.title ?? "Unknown Title", // Fallback for missing title
            poster_path: movie?.poster_path, // Already filtered, so guaranteed
            release_date: movie?.release_date ?? "", // Fallback to empty string
            vote_average: movie?.vote_average ?? 0, // Fallback to 0
            type: "movie",
            url: movie?.id ? `/movie/${movie.id}` : "#", // Fallback to non-clickable URL
          })) || []
      );
    } else if (pageType === "tv") {
      return (
        tvData?.results
          ?.filter((tv: any) => tv?.poster_path) // Filter out items without poster_path
          .map((tv: any) => ({
            id: tv?.id?.toString() ?? "", // Fallback to empty string
            title: tv?.name ?? "Unknown Title", // Fallback for missing name
            poster_path: tv?.poster_path, // Already filtered, so guaranteed
            release_date: tv?.first_air_date ?? "", // Fallback to empty string
            vote_average: tv?.vote_average ?? 0, // Fallback to 0
            type: "tv",
            url: tv?.id ? `/tv/${tv.id}` : "#", // Fallback to non-clickable URL
          })) || []
      );
    } else if (pageType === "people") {
      return (
        personData?.results
          ?.filter((person: any) => person?.profile_path) // Filter out items without profile_path
          .map((person: any) => ({
            id: person?.id?.toString() ?? "", // Fallback to empty string
            title: person?.name ?? "Unknown Person", // Fallback for missing name
            poster_path: person?.profile_path, // Already filtered, so guaranteed
            release_date: "", // Always empty for people
            vote_average: 0, // Always 0 for people
            type: "person",
            url: person?.id ? `/person/${person.id}` : "#", // Fallback to non-clickable URL
          })) || []
      );
    }
    return [];
  })();

  // Determine loading and error states based on pageType
  const isLoading =
    pageType === "movies"
      ? movieLoading
      : pageType === "tv"
        ? tvLoading
        : personLoading;
  const isError =
    pageType === "movies"
      ? movieError
      : pageType === "tv"
        ? tvError
        : personError;
  const errorMessage =
    pageType === "movies"
      ? (movieErrorMsg?.message ?? "An error occurred")
      : pageType === "tv"
        ? (tvErrorMsg?.message ?? "An error occurred")
        : (personErrorMsg?.message ?? "An error occurred");

  // Determine result type label for UI
  const resultTypeLabel =
    pageType === "movies"
      ? "Movies"
      : pageType === "tv"
        ? "TV Shows"
        : "People";

  // Modal content
  const modalContent = (
    <section
      className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-md overflow-hidden transition-opacity duration-300"
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
            placeholder={`Search for ${resultTypeLabel.toLowerCase()}, e.g., ${
              pageType === "movies"
                ? "The Godfather"
                : pageType === "tv"
                  ? "Breaking Bad"
                  : "Robert Downey Jr."
            }`}
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
                {resultTypeLabel} Search Results
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
              {results.length === 0 && search.length > 0 && (
                <p className="text-gray-400 text-center col-span-full">
                  No {resultTypeLabel.toLowerCase()} found
                </p>
              )}
              {search.length === 0 && (
                <p className="text-gray-400 text-center col-span-full">
                  Search for your favorite {resultTypeLabel.toLowerCase()}...
                </p>
              )}
              {results.map((item: SearchCardProps) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="transform hover:scale-102 transition-transform duration-300">
                  <SearchCard
                    title={item.title}
                    poster_path={item.poster_path}
                    release_date={item.release_date}
                    vote_average={item.vote_average}
                    type={item.type}
                    url={item.url}
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

  // Only render if status is true
  if (!status) return null;

  return createPortal(modalContent, document.getElementById("modal-root")!);
};

export default Search;
