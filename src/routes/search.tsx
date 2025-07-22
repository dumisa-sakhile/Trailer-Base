import {
  createFileRoute,
  Link,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchMovies, discoverMovies } from "@/api/movie";
import { searchTV, discoverTV } from "@/api/tv";
import { searchPerson, getTrendingPeople } from "@/api/people";
import MediaCard from "@/components/MediaCard";
import PersonSearchCard from "@/components/PersonSearchCard";

import movieGenres from "@/data/movieGenres";
import tvGenres from "@/data/tvGenres";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search as SearchIconLucide,
  ChevronDown,
  Frown,
  Loader2,
  Check,
  X,
} from "lucide-react";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, string>) => ({
    query: search.query || "",
    type: search.type || "movies",
    page: search.page ? parseInt(search.page) : 1,
  }),
  component: Search,
});

type SearchCardUnifiedProps =
  | {
      id: string;
      title: string;
      poster_path: string | null;
      type: "movie" | "tv";
      url: string;
      release_date: string;
      vote_average: number;
    }
  | {
      id: string;
      name: string;
      profile_path: string | null;
      type: "person";
      url: string;
    };

interface Genre {
  id: number;
  name: string;
}

function Search() {
  const navigate = useNavigate();
  const { query, page, type } = useSearch({ from: "/search" });

  const [isSearchTypeDropdownOpen, setIsSearchTypeDropdownOpen] =
    useState(false);
  const searchTypeDropdownRef = useRef<HTMLDivElement>(null);

  const [isGenrePopupOpen, setIsGenrePopupOpen] = useState(false);
  const genreButtonRef = useRef<HTMLButtonElement>(null);
  const genrePopupRef = useRef<HTMLDivElement>(null);

  const [inputValue, setInputValue] = useState(query);

  useEffect(() => {
    setInputValue(query);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSearchTypeDropdownOpen &&
        searchTypeDropdownRef.current &&
        !searchTypeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSearchTypeDropdownOpen(false);
      }
      if (
        isGenrePopupOpen &&
        genrePopupRef.current &&
        !genrePopupRef.current.contains(event.target as Node) &&
        genreButtonRef.current &&
        !genreButtonRef.current.contains(event.target as Node)
      ) {
        setIsGenrePopupOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchTypeDropdownOpen, isGenrePopupOpen]);

  const queryOptions = {
    queryKey: ["search", query, page, type],
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

  const discoverMoviesQuery = useQuery({
    queryKey: ["discoverMovies"],
    queryFn: () => discoverMovies(),
    enabled: !query && type === "movies",
    staleTime: 1000 * 60 * 60,
  });

  const discoverTvQuery = useQuery({
    queryKey: ["discoverTv"],
    queryFn: () => discoverTV(),
    enabled: !query && type === "tv",
    staleTime: 1000 * 60 * 60,
  });

  const trendingPeopleQuery = useQuery({
    queryKey: ["trendingPeople"],
    queryFn: () => getTrendingPeople("day", 1),
    enabled: !query && type === "people",
    staleTime: 1000 * 60 * 60,
  });

  const results: SearchCardUnifiedProps[] = (() => {
    let raw: any[] | undefined;
    let itemType: "movie" | "tv" | "person";

    if (type === "movies") {
      raw = movieQuery.data?.results;
      itemType = "movie";
    } else if (type === "tv") {
      raw = tvQuery.data?.results;
      itemType = "tv";
    } else if (type === "people") {
      raw = personQuery.data?.results;
      itemType = "person";
    } else {
      return [];
    }

    if (!raw) return [];

    return raw
      .filter((item: any) => item?.poster_path || item?.profile_path)
      .map((item: any) => {
        if (itemType === "person") {
          return {
            id: item.id?.toString() ?? "",
            name: item.name ?? "Unknown Person",
            profile_path:
              item.profile_path ??
              "https://placehold.co/500x750/333333/FFFFFF?text=No+Image",
            type: "person",
            url: `/people/${item.id ?? "#"}`,
          } as SearchCardUnifiedProps;
        } else {
          return {
            id: item.id?.toString() ?? "",
            title: itemType === "movie" ? item.title : item.name,
            poster_path:
              item.poster_path ??
              "https://placehold.co/500x750/333333/FFFFFF?text=No+Image",
            release_date: item.release_date ?? item.first_air_date ?? "N/A",
            vote_average: item.vote_average ?? 0,
            type: itemType,
            url: `/${itemType === "movie" ? "movie" : "tv"}/${item.id ?? "#"}`,
          } as SearchCardUnifiedProps;
        }
      });
  })();

  const discoverData: SearchCardUnifiedProps[] = (() => {
    if (!query) {
      let rawData: any[] | undefined;
      let itemType: "movie" | "tv" | "person";

      if (type === "movies") {
        rawData = discoverMoviesQuery.data?.results;
        itemType = "movie";
      } else if (type === "tv") {
        rawData = discoverTvQuery.data?.results;
        itemType = "tv";
      } else if (type === "people") {
        rawData = trendingPeopleQuery.data?.results;
        itemType = "person";
      } else {
        return [];
      }

      if (!rawData) return [];

      return rawData
        .filter((item: any) => item?.poster_path || item?.profile_path)
        .map((item: any) => {
          if (itemType === "person") {
            return {
              id: item.id.toString(),
              name: item.name,
              profile_path:
                item.profile_path ||
                "https://placehold.co/500x750/333333/FFFFFF?text=No+Image",
              type: "person",
              url: `/people/${item.id}`,
            } as SearchCardUnifiedProps;
          } else {
            return {
              id: item.id.toString(),
              title: itemType === "movie" ? item.title : item.name,
              poster_path:
                item.poster_path ||
                "https://placehold.co/500x750/333333/FFFFFF?text=No+Image",
              release_date: item.release_date || item.first_air_date || "N/A",
              vote_average: item.vote_average || 0,
              type: itemType,
              url: `/${itemType === "movie" ? "movie" : "tv"}/${item.id}`,
            } as SearchCardUnifiedProps;
          }
        });
    }
    return [];
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

  const currentGenreList = type === "movies" ? movieGenresList : tvGenresList;

  useEffect(() => {
    const handler = setTimeout(() => {
      if (inputValue !== query) {
        navigate({
          to: "/search",
          search: { query: inputValue, type, page: 1 },
        });
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, type, navigate, query]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleCategoryChange = (newType: "movies" | "tv" | "people") => {
    navigate({
      to: "/search",
      search: { query: "", type: newType, page: 1 },
    });
    setIsSearchTypeDropdownOpen(false);
    if (newType === "people") {
      setIsGenrePopupOpen(false);
    }
  };

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

  const getGenreButtonText = () => {
    if (type === "movies") {
      return " Movie Genres";
    } else if (type === "tv") {
      return " TV Show Genres";
    }
    return " Genres";
  };

  const LoadingAnimation = () => (
    <motion.div
      className="w-full flex flex-col items-center py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}>
        <Loader2 size={48} className="text-blue-400 mb-4" />
      </motion.div>
      <p className="text-xl sm:text-2xl font-light text-gray-300 mb-2">
        Loading {label.toLowerCase()}...
      </p>
    </motion.div>
  );

  return (
    <section className="min-h-screen text-white flex flex-col">
      <header className="py-6 md:p-8 flex flex-col gap-6 sm:gap-8 z-10">
        <h1 className="text-4xl lg:text-5xl text-white text-center font-extrabold tracking-tight">
          Discover Your Next Favorite
        </h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 w-full max-w-5xl mx-auto px-4">
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
              value={inputValue}
              onChange={handleSearchChange}
              // Placeholder text is now white
              className="w-full h-14 px-5 py-3 rounded-full bg-[#242424] border border-[#141414] text-base text-white placeholder:text-white pl-14 pr-36 leading-6 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all font-normal shadow-lg"
              aria-label={`Search ${label.toLowerCase()}`}
            />
            <span className="absolute left-5 top-1/2 -translate-y-1/2">
              <SearchIconLucide size={20} className="text-gray-400" />
            </span>

            <div
              ref={searchTypeDropdownRef}
              className="absolute right-3 top-1/2 -translate-y-1/2">
              <motion.button
                onClick={() => {
                  setIsSearchTypeDropdownOpen(!isSearchTypeDropdownOpen);
                  setIsGenrePopupOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 border border-blue-700 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:bg-blue-700 hover:border-blue-800"
                aria-label="Toggle search type dropdown"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}>
                {getSearchTypeLabel()}
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    isSearchTypeDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </motion.button>
              <AnimatePresence>
                {isSearchTypeDropdownOpen && (
                  <motion.div
                    className="absolute right-0 mt-2 w-48 bg-[#242424] rounded-xl border border-[#141414] shadow-xl z-30 flex flex-col overflow-hidden p-2"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}>
                    <button
                      onClick={() => handleCategoryChange("movies")}
                      className={`flex items-center justify-between w-full text-left px-4 py-3 text-gray-300 hover:text-blue-300 rounded-lg transition-colors text-base font-medium ${
                        type === "movies" ? "text-blue-300" : ""
                      }`}>
                      Movies
                      {type === "movies" && (
                        <Check size={18} className="text-blue-400" />
                      )}
                    </button>
                    <button
                      onClick={() => handleCategoryChange("tv")}
                      className={`flex items-center justify-between w-full text-left px-4 py-3 text-gray-300 hover:text-blue-300 rounded-lg transition-colors text-base font-medium ${
                        type === "tv" ? "text-blue-300" : ""
                      }`}>
                      TV Shows
                      {type === "tv" && (
                        <Check size={18} className="text-blue-400" />
                      )}
                    </button>
                    <button
                      onClick={() => handleCategoryChange("people")}
                      className={`flex items-center justify-between w-full text-left px-4 py-3 text-gray-300 hover:text-blue-300 rounded-lg transition-colors text-base font-medium ${
                        type === "people" ? "text-blue-300" : ""
                      }`}>
                      People
                      {type === "people" && (
                        <Check size={18} className="text-blue-400" />
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {(type === "movies" || type === "tv") && (
            <div className="relative">
              <button
                ref={genreButtonRef}
                onClick={() => {
                  setIsGenrePopupOpen(!isGenrePopupOpen);
                  setIsSearchTypeDropdownOpen(false);
                }}
                className="hidden sm:flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#242424] border border-[#141414] text-base text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto hover:bg-neutral-700 hover:border-blue-500 transition-colors shadow-lg"
                aria-label="Open genre selection popup">
                <span>{getGenreButtonText()}</span>
                <ChevronDown
                  size={18}
                  className={`transition-transform ${
                    isGenrePopupOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {isGenrePopupOpen && (
                  <motion.div
                    ref={genrePopupRef}
                    className="absolute right-0 top-full mt-2 w-80 bg-[#242424] rounded-xl border border-[#141414] shadow-xl z-20 flex flex-col overflow-hidden p-4"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}>
                    <button
                      onClick={() => setIsGenrePopupOpen(false)}
                      className="absolute top-2 right-2 p-1 text-white/80 hover:text-white hover:bg-neutral-700 rounded-full transition-colors"
                      aria-label="Close genre popup">
                      <X size={20} />
                    </button>

                    {/* Max height added back to this div, and links are block with no background */}
                    <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar pt-6 pb-2 max-h-[60vh]">
                      {currentGenreList.length > 0 ? (
                        currentGenreList.map((genre) => (
                          <Link
                            key={genre.id}
                            to={`/${type === "movies" ? "movie" : "tv"}/$type/$typeName/$typeId`}
                            params={{
                              type: "with_genres",
                              typeName: genre.name,
                              typeId: String(genre.id),
                            }}
                            search={{ page: 1 }}
                            // Removed bg-neutral-700, keeping hover:bg-blue-600
                            className="block w-full text-left px-4 py-2 rounded-lg hover:bg-blue-600 text-white text-sm font-medium transition-colors cursor-pointer"
                            onClick={() => setIsGenrePopupOpen(false)}>
                            {genre.name}
                          </Link>
                        ))
                      ) : (
                        <p className="text-white/70 text-sm text-center py-4">
                          No genres available for{" "}
                          {type === "movies" ? "movies" : "TV shows"}.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-xl sm:text-2xl text-white mb-6 font-semibold border-b border-neutral-800 pb-3">
            {query
              ? `Results for "${query}" in ${label}`
              : `Browse Popular ${label}`}
          </h3>

          <section className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
            {isLoading && <LoadingAnimation />}

            {isError && (
              <motion.div
                className="w-full text-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}>
                <p className="text-red-400 font-light text-base sm:text-lg">
                  Error: {errorMessage}
                </p>
              </motion.div>
            )}

            {!isLoading && query && results.length === 0 && (
              <motion.div
                className="w-full flex flex-col items-center py-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}>
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}>
                  <Frown size={48} className="text-gray-400 mb-4" />
                </motion.div>
                <p className="text-xl sm:text-2xl font-light text-gray-300 mb-2">
                  No {label.toLowerCase()} found for "{query}"
                </p>
                <p className="text-sm sm:text-base text-gray-500">
                  Try a different search term or check your spelling
                </p>
              </motion.div>
            )}

            {!isLoading &&
              (query ? results : discoverData).length > 0 &&
              (query ? results : discoverData).map((item, index: number) => (
                <motion.div
                  key={`${item.type}-${item.id}-${index}`}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * index }}>
                  {item.type === "person" ? (
                    <PersonSearchCard
                      id={item.id}
                      name={item.name}
                      profile_path={item.profile_path}
                      url={item.url}
                    />
                  ) : (
                    <MediaCard
                      id={Number(item.id)}
                      title={item.title}
                      release_date={item.release_date}
                      poster_path={item.poster_path}
                      vote_average={item.vote_average}
                      type={item.type}
                    />
                  )}
                </motion.div>
              ))}

            {!query && !isLoading && discoverData.length === 0 && (
              <div className="w-full text-gray-500 text-sm mt-4 text-center">
                No popular content available for this category.
              </div>
            )}
          </section>
        </div>
      </main>
    </section>
  );
}

export default Search;
