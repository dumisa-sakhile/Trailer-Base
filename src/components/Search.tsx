import { createPortal } from "react-dom";
import SearchCard from "./SearchCard";
import { useQuery } from "@tanstack/react-query";
import { searchMovies } from "@/api/movie";
import { searchTV } from "@/api/tv";
import { searchPerson } from "@/api/people";
import { useState } from "react";
import { useSearchContext } from "@/context/searchContext";
import { SearchIcon } from "./icons/Icons";

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
          ?.filter((movie: any) => movie?.poster_path)
          .map((movie: any) => ({
            id: movie?.id?.toString() ?? "",
            title: movie?.title ?? "Unknown Title",
            poster_path: movie?.poster_path,
            release_date: movie?.release_date ?? "",
            vote_average: movie?.vote_average ?? 0,
            type: "movie",
            url: movie?.id ? `/movie/${movie.id}` : "#",
          })) || []
      );
    } else if (pageType === "tv") {
      return (
        tvData?.results
          ?.filter((tv: any) => tv?.poster_path)
          .map((tv: any) => ({
            id: tv?.id?.toString() ?? "",
            title: tv?.name ?? "Unknown Title",
            poster_path: tv?.poster_path,
            release_date: tv?.first_air_date ?? "",
            vote_average: tv?.vote_average ?? 0,
            type: "tv",
            url: tv?.id ? `/tv/${tv.id}` : "#",
          })) || []
      );
    } else if (pageType === "people") {
      return (
        personData?.results
          ?.filter((person: any) => person?.profile_path)
          .map((person: any) => ({
            id: person?.id?.toString() ?? "",
            title: person?.name ?? "Unknown Person",
            poster_path: person?.profile_path,
            release_date: "",
            vote_average: 0,
            type: "person",
            url: person?.id ? `/people/${person.id}` : "#",
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#333]/50 backdrop-blur-sm overflow-hidden transition-all duration-500 ease-out cursor-pointer"
      onClick={() => setStatus(false)}>
      <div
        className="relative bg-[#333] md:rounded-2xl w-full h-full md:w-[700px] md:h-[750px] max-w-[95vw] max-h-[95vh] overflow-auto text-gray-100 shadow-2xl transform transition-all duration-300 ease-out cursor-default"
        onClick={(e) => e.stopPropagation()}>
        <nav className="w-full flex items-center p-4 md:p-6 border-b border-blue-900/20">
          <div className="relative w-full">
            <input
              type="search"
              name="search"
              autoFocus
              id="search-input"
              placeholder={`Search ${resultTypeLabel.toLowerCase()}, e.g., ${
                pageType === "movies"
                  ? "Inception"
                  : pageType === "tv"
                    ? "Stranger Things"
                    : "Leonardo DiCaprio"
              }`}
              className="w-full p-4 pl-12 bg-white/10 rounded-xl text-gray-100 bricolage-grotesque-regular text-lg placeholder:text-gray-300 placeholder:host-grotesk-light outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300 ease-in-out shadow-inner ring-1 ring-white/10"
              autoComplete="off"
              onChange={(e) => setSearch(e.target.value)}
              value={search}
            />
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <SearchIcon fill="white" />
            </span>
          </div>
        </nav>
        <main className="p-6 md:p-8">
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <h2 className="bricolage-grotesque-bold text-sm text-white tracking-tight">
                {resultTypeLabel} Results
              </h2>
              <button
                className="md:hidden button-style bg-white hover:bg-gray-200 text-black bricolage-grotesque-regular px-6 py-6 rounded-full text-sm md:text-base shadow-lg"
                onClick={() => setStatus(false)}>
                Close
              </button>
            </div>
            <section className="flex flex-wrap gap-4 md:gap-6 justify-center items-center">
              {isLoading && (
                <p className="host-grotesk-light text-gray-400 text-center col-span-full animate-pulse text-lg">
                  Loading...
                </p>
              )}
              {isError && (
                <p className="host-grotesk-regular text-red-400 text-center col-span-full text-lg">
                  Error: {errorMessage}
                </p>
              )}
              {!isLoading && results.length === 0 && search.length > 0 && (
                <p className="host-grotesk-light text-gray-400 text-center col-span-full text-lg">
                  No {resultTypeLabel.toLowerCase()} found
                </p>
              )}
              {search.length === 0 && (
                <p className="host-grotesk-light text-gray-400 text-center col-span-full text-lg">
                  Search for your favorite {resultTypeLabel.toLowerCase()}...
                </p>
              )}
              {results.map((item: SearchCardProps) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="relative group transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-900/20">
                  <SearchCard
                    title={item.title}
                    poster_path={item.poster_path}
                    release_date={item.release_date}
                    vote_average={item.vote_average}
                    type={item.type}
                    url={item.url}
                    id={item.id}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none" />
                </div>
              ))}
            </section>
          </div>
        </main>
      </div>
    </section>
  );

  if (!status) return null;

  return createPortal(modalContent, document.getElementById("modal-root")!);
};

export default Search;
