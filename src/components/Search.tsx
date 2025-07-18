import {
  createFileRoute,
  Link,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchMovies } from "@/api/movie";
import { searchTV } from "@/api/tv";
import { searchPerson } from "@/api/people";
import SearchCard from "@/components/SearchCard";
import movieGenres from "@/data/movieGenres";
import tvGenres from "@/data/tvGenres";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIconLucide, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, string>) => ({
    query: search.query || "",
    type: search.type || "movies",
    page: search.page ? parseInt(search.page) : 1,
    genreId: search.genreId ? parseInt(search.genreId) : undefined,
  }),
  component: Search,
});

interface SearchCardProps {
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  type: string;
  url: string;
  id: string;
}

interface Genre {
  id: number;
  name: string;
}

function Search() {
  const navigate = useNavigate();
  const { query, page, type, genreId } = useSearch({ from: "/search" });

  const [isSearchTypeDropdownOpen, setIsSearchTypeDropdownOpen] =
    useState(false);
  const [isMovieGenreDropdownOpen, setIsMovieGenreDropdownOpen] =
    useState(false);
  const [isTvGenreDropdownOpen, setIsTvGenreDropdownOpen] = useState(false);

  // --- Fetch ---
  const queryOptions = {
    queryKey: ["search", query, page, type, genreId],
    enabled: !!query,
  };
  const movieQuery = useQuery({
    ...queryOptions,
    queryFn: () => searchMovies(page, query),
    enabled: queryOptions.enabled && type === "movies",
  });
  const tvQuery = useQuery({
    ...queryOptions,
    queryFn: () => searchTV(page, query),
    enabled: queryOptions.enabled && type === "tv",
  });
  const personQuery = useQuery({
    ...queryOptions,
    queryFn: () => searchPerson(page, query),
    enabled: queryOptions.enabled && type === "people",
  });

  // --- Prepare results ---
  const results = (() => {
    const raw =
      type === "movies"
        ? movieQuery.data?.results
        : type === "tv"
          ? tvQuery.data?.results
          : personQuery.data?.results;
    if (!raw) return [];
    return raw
      .filter((item: any) => item?.poster_path || item?.profile_path)
      .map((item: any) => ({
        id: item?.id?.toString() ?? "",
        title:
          type === "movies"
            ? item?.title
            : type === "tv"
              ? item?.name
              : (item?.name ?? "Unknown"),
        poster_path:
          item?.poster_path ??
          item?.profile_path ??
          "https://placehold.co/150x225/333333/FFFFFF?text=No+Image",
        release_date:
          item?.release_date ?? item?.first_air_date ?? "Unknown Date",
        vote_average: item?.vote_average ?? 0,
        type,
        url: `/${type === "movies" ? "movie" : type}/${item?.id ?? "#"}`,
      }));
  })();

  const isLoading =
    type === "movies"
      ? movieQuery.isLoading
      : type === "tv"
        ? tvQuery.isLoading
        : personQuery.isLoading;

  const isError =
    type === "movies"
      ? movieQuery.isError
      : type === "tv"
        ? tvQuery.isError
        : personQuery.isError;

  const errorMessage =
    type === "movies"
      ? (movieQuery.error as Error)?.message
      : type === "tv"
        ? (tvQuery.error as Error)?.message
        : (personQuery.error as Error)?.message;

  const label =
    type === "movies" ? "Movies" : type === "tv" ? "TV Shows" : "People";

  const movieGenresList: Genre[] = movieGenres();
  const tvGenresList: Genre[] = tvGenres();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    navigate({
      to: "/search",
      search: { query: e.target.value, type, genreId: undefined, page: 1 },
    });
  };

  const handleCategoryChange = (newType: string) => {
    navigate({
      to: "/search",
      search: { query: "", type: newType, genreId: undefined, page: 1 },
    });
    setIsSearchTypeDropdownOpen(false);
    setIsMovieGenreDropdownOpen(false);
    setIsTvGenreDropdownOpen(false);
  };

  const getGenreLinkClasses = (genreIdToCheck: number) =>
    `block text-gray-300 hover:text-white transition-colors py-2 px-3 focus:outline-none break-words min-w-0
      ${genreId === genreIdToCheck ? "text-blue-400 font-medium" : ""}`;

  const getSearchTypeLabel = () => {
    switch (type) {
      case "movies":
        return "Movies";
      case "tv":
        return "TV Shows";
      case "people":
        return "People";
      default:
        return "Select Type";
    }
  };

  // --- Animation Variants for Not-found & loader ---
  const notFoundIconAnim = {
    initial: { scale: 0.9, opacity: 0, rotate: -15 },
    animate: {
      scale: 1.05,
      opacity: 1,
      rotate: 0,
      transition: { type: "spring", stiffness: 200 },
    },
    exit: {
      scale: 0.9,
      opacity: 0,
      rotate: 15,
      transition: { duration: 0.25 },
    },
  };

  const loaderAnim = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      rotate: 360,
      transition: { repeat: Infinity, duration: 1.2, ease: "linear" },
    },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-950 to-black text-white flex flex-col">
      {/* --- Header (NOT fixed) --- */}
      <header className="w-full p-4 sm:p-8 border-b border-white/5 flex flex-col gap-4 sm:gap-8 bg-gray-950/70 backdrop-blur-lg shadow-lg z-20 static">
        <h2 className="text-3xl text-white text-center font-bold">
          Discover Your Next Favorite
        </h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 w-full max-w-5xl mx-auto">
          {/* --- Search Input & Type Dropdown --- */}
          <div className="relative flex-grow">
            <input
              autoFocus
              type="search"
              placeholder={`Search ${label.toLowerCase()}, e.g. ${
                type === "movies"
                  ? "Inception"
                  : type === "tv"
                    ? "The Chosen"
                    : "Nomzamo Mbatha"
              }`}
              value={query}
              onChange={handleSearchChange}
              className="w-full h-12 sm:h-14 px-4 sm:px-5 py-2 sm:py-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-sm sm:text-base text-white placeholder:text-gray-400 pl-12 sm:pl-16 pr-32 sm:pr-40 leading-6 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-normal"
              aria-label={`Search ${label.toLowerCase()}`}
            />
            <span className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2">
              <SearchIconLucide size={18} className="text-gray-400" />
            </span>
            {/* Search Type Toggle */}
            <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2">
              <button
                onClick={() => {
                  setIsSearchTypeDropdownOpen((o) => !o);
                  setIsMovieGenreDropdownOpen(false);
                  setIsTvGenreDropdownOpen(false);
                }}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-blue-700/80 hover:bg-blue-800 transition-colors text-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle search type dropdown">
                {getSearchTypeLabel()}
                <ChevronDown
                  size={14}
                  className={`transition-transform ${isSearchTypeDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {isSearchTypeDropdownOpen && (
                  <motion.div
                    className="absolute right-0 mt-2 sm:mt-3 w-36 sm:w-40 bg-black/80 backdrop-blur-xl rounded-lg border border-white/10 shadow-xl z-30"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}>
                    <button
                      onClick={() => handleCategoryChange("movies")}
                      className={`w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-t-lg transition-colors text-sm sm:text-base ${type === "movies" ? "text-blue-400 font-medium" : ""}`}>
                      Movies
                    </button>
                    <button
                      onClick={() => handleCategoryChange("tv")}
                      className={`w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-gray-300 hover:text-white hover:bg-white/5 transition-colors text-sm sm:text-base ${type === "tv" ? "text-blue-400 font-medium" : ""}`}>
                      TV Shows
                    </button>
                    <button
                      onClick={() => handleCategoryChange("people")}
                      className={`w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-b-lg transition-colors text-sm ${type === "people" ? "text-blue-400 font-medium" : ""}`}>
                      People
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          {/* Movie Genre Dropdown */}
          <div className="relative flex-shrink-0 w-full sm:w-auto hidden md:block">
            <button
              onClick={() => {
                setIsMovieGenreDropdownOpen((o) => !o);
                setIsSearchTypeDropdownOpen(false);
                setIsTvGenreDropdownOpen(false);
              }}
              className="flex items-center justify-between gap-1 sm:gap-2 px-4 sm:px-5 py-2 sm:py-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-sm sm:text-base text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              aria-label="Toggle movie genre dropdown">
              <span>
                {genreId && movieGenresList.find((g) => g.id === genreId)
                  ? movieGenresList.find((g) => g.id === genreId)?.name
                  : "Movie Genre"}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${isMovieGenreDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {isMovieGenreDropdownOpen && (
                <motion.div
                  className="absolute right-0 sm:left-0 mt-2 sm:mt-3 w-56 bg-black/80 backdrop-blur-xl rounded-lg border border-white/10 shadow-xl z-20"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 p-3 sm:p-4">
                    {movieGenresList.length > 0 ? (
                      movieGenresList.map((genre) => (
                        <Link
                          key={genre.id}
                          to="/movie/$type/$typeName/$typeId"
                          params={{
                            type: "with_genres",
                            typeName: genre.name,
                            typeId: String(genre.id),
                          }}
                          search={{ page: 1 }}
                          className={getGenreLinkClasses(genre.id)}>
                          {genre.name}
                        </Link>
                      ))
                    ) : (
                      <p className="col-span-2 text-gray-400 text-sm sm:text-base">
                        No genres available.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* TV Genre Dropdown */}
          <div className="relative flex-shrink-0 w-full sm:w-auto hidden md:block">
            <button
              onClick={() => {
                setIsTvGenreDropdownOpen((o) => !o);
                setIsSearchTypeDropdownOpen(false);
                setIsMovieGenreDropdownOpen(false);
              }}
              className="flex items-center justify-between gap-1 sm:gap-2 px-4 sm:px-5 py-2 sm:py-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-sm sm:text-base text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              aria-label="Toggle TV genre dropdown">
              <span>
                {genreId && tvGenresList.find((g) => g.id === genreId)
                  ? tvGenresList.find((g) => g.id === genreId)?.name
                  : "TV Genre"}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${isTvGenreDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {isTvGenreDropdownOpen && (
                <motion.div
                  className="absolute right-0 sm:left-0 mt-2 sm:mt-3 w-56 bg-black/80 backdrop-blur-xl rounded-lg border border-white/10 shadow-xl z-20"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 p-3 sm:p-4">
                    {tvGenresList.length > 0 ? (
                      tvGenresList.map((genre) => (
                        <Link
                          key={genre.id}
                          to="/tv/$type/$typeName/$typeId"
                          params={{
                            type: "with_genres",
                            typeName: genre.name,
                            typeId: String(genre.id),
                          }}
                          search={{ page: 1 }}
                          className={getGenreLinkClasses(genre.id)}>
                          {genre.name}
                        </Link>
                      ))
                    ) : (
                      <p className="col-span-2 text-gray-400 text-sm sm:text-base">
                        No genres available.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* --- Main content --- */}
      <main className="p-6 flex-1 overflow-y-auto custom-scrollbar">
        <h3 className="text-xl sm:text-2xl text-white mb-6 font-medium">
          {query
            ? `Results for "${query}" in ${label}`
            : `Browse Popular ${label}`}
          {genreId &&
            ` (Genre: ${
              (type === "movies" ? movieGenresList : tvGenresList).find(
                (g) => g.id === genreId
              )?.name
            })`}
        </h3>
        <section className="flex flex-wrap justify-center items-start gap-4 sm:gap-6 min-h-[230px]">
          <AnimatePresence>
            {isLoading && (
              <motion.div
                key="loader"
                className="w-full flex flex-col items-center py-8"
                initial="initial"
                animate="animate"
                exit="exit">
                <motion.svg
                  width={65}
                  height={65}
                  viewBox="0 0 48 48"
                  fill="none"
                  stroke="currentColor"
                  className="mb-3 text-blue-400"
                  variants={loaderAnim}
                  style={{ display: "inline-block" }}>
                  <motion.circle
                    cx="24"
                    cy="24"
                    r="18"
                    strokeWidth="4"
                    strokeDasharray="90"
                    strokeDashoffset="60"
                    strokeLinecap="round"
                  />
                </motion.svg>
                <p className="text-gray-400 font-light text-lg animate-pulse">
                  Loading {label.toLowerCase()}...
                </p>
              </motion.div>
            )}

            {isError && (
              <motion.div
                key="error"
                className="w-full text-center py-8"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                transition={{ duration: 0.2 }}>
                <p className="text-red-400 font-medium text-lg sm:text-xl mb-2">
                  Error: {errorMessage}
                </p>
              </motion.div>
            )}

            {!isLoading && query && results.length === 0 && (
              <motion.div
                key="notfound"
                className="w-full text-center py-12 flex flex-col items-center"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={notFoundIconAnim}>
                {/* Animated Big Not Found SVG */}
                <svg
                  className="mx-auto mb-3"
                  width={85}
                  height={85}
                  viewBox="0 0 64 64"
                  fill="none"
                  stroke="currentColor">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="#60a5fa"
                    strokeWidth="5"
                    fill="none"
                  />
                  <line
                    x1="23"
                    y1="27"
                    x2="41"
                    y2="27"
                    stroke="#60a5fa"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.7"
                  />
                  <ellipse
                    cx="25.5"
                    cy="34"
                    rx="2.5"
                    ry="3.5"
                    fill="#60a5fa"
                    opacity="0.6"
                  />
                  <ellipse
                    cx="38.5"
                    cy="34"
                    rx="2.5"
                    ry="3.5"
                    fill="#60a5fa"
                    opacity="0.6"
                  />
                  <path
                    d="M27 43 Q32 48 37 43"
                    stroke="#60a5fa"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
                <p className="text-lg sm:text-xl font-light text-gray-400 mb-2">
                  No {label.toLowerCase()} found for "
                  <span className="text-white">{query}</span>"
                </p>
                <p className="text-sm sm:text-base font-light text-gray-500">
                  Try a different search term or genre.
                </p>
              </motion.div>
            )}

            {!isLoading && !query && !genreId && (
              <motion.div
                key="suggest"
                className="w-full text-center py-10 flex flex-col items-center"
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.97 }}
                transition={{ duration: 0.3, type: "spring" }}>
                <svg
                  width={68}
                  height={68}
                  viewBox="0 0 64 64"
                  fill="none"
                  className="mx-auto mb-3 text-blue-400">
                  <circle
                    cx="32"
                    cy="32"
                    r="29"
                    stroke="#38bdf8"
                    strokeWidth="3"
                    fill="#0f172a"
                  />
                  <line
                    x1="44"
                    y1="44"
                    x2="54"
                    y2="54"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="13"
                    stroke="#7dd3fc"
                    strokeWidth="3"
                    fill="#172554"
                  />
                </svg>
                <p className="text-lg sm:text-xl text-gray-400 font-light">
                  Start typing above to search your favorite{" "}
                  {label.toLowerCase()}...
                </p>
                <p className="text-sm sm:text-base font-light text-gray-500 mt-2">
                  Popular {label.toLowerCase()} will appear here.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          {results.map((item: SearchCardProps) => (
            <motion.div
              key={`${item.type}-${item.id}`}
              className="flex-shrink-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}>
              <SearchCard {...item} />
            </motion.div>
          ))}
        </section>
      </main>
    </section>
  );
}

export default Search;
