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
  X as CloseIcon,
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
  const [isGenreModalOpen, setIsGenreModalOpen] = useState(false);
  const [activeGenreTab, setActiveGenreTab] = useState<"movie" | "tv">("movie");
  const [inputValue, setInputValue] = useState(query);

  const searchTypeDropdownRef = useRef<HTMLDivElement>(null);

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
    };

    if (isSearchTypeDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchTypeDropdownOpen]);

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

  const isDiscoverLoading =
    (type === "movies" && discoverMoviesQuery.isLoading) ||
    (type === "tv" && discoverTvQuery.isLoading) ||
    (type === "people" && trendingPeopleQuery.isLoading);

  const isDiscoverError =
    (type === "movies" && discoverMoviesQuery.isError) ||
    (type === "tv" && discoverTvQuery.isError) ||
    (type === "people" && trendingPeopleQuery.isError);

  const discoverErrorMessage =
    (type === "movies" && (discoverMoviesQuery.error as Error)?.message) ||
    (type === "tv" && (discoverTvQuery.error as Error)?.message) ||
    (type === "people" && (trendingPeopleQuery.error as Error)?.message);

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

  const getHintText = () => {
    switch (type) {
      case "movies":
        return "Need more movie inspiration?";
      case "tv":
        return "Need more TV show inspiration?";
      case "people":
        return "Looking for more people?";
      default:
        return "Need some inspiration?";
    }
  };

  const getHeadingText = () => {
    switch (type) {
      case "movies":
        return "Popular movie searches:";
      case "tv":
        return "Popular TV show searches:";
      case "people":
        return "Popular people searches:";
      default:
        return "Popular searches:";
    }
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
    <section className="min-h-screen bg-gradient-to-br from-gray-950 to-black text-white flex flex-col">
      <header className="py-4 md:p-8 flex flex-col gap-4 sm:gap-8 z-10 shadow-lg">
        <h2 className="text-3xl text-white text-center font-bold">
          Discover Your Next Favorite
        </h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 w-full max-w-5xl mx-auto">
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
              className="w-full h-12 sm:h-14 px-4 sm:px-5 py-2 sm:py-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-sm sm:text-base text-white placeholder:text-gray-400 pl-12 sm:pl-16 pr-32 sm:pr-40 leading-6 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-normal"
              aria-label={`Search ${label.toLowerCase()}`}
            />
            <span className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2">
              <SearchIconLucide size={18} className="text-gray-400" />
            </span>

            <div
              ref={searchTypeDropdownRef}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2">
              <motion.button
                onClick={() => {
                  setIsSearchTypeDropdownOpen(!isSearchTypeDropdownOpen);
                  setIsGenreModalOpen(false);
                }}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full
                               bg-white/5 backdrop-blur-md border border-white/10
                               text-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500
                               transition-all"
                aria-label="Toggle search type dropdown"
                whileHover={{
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  borderColor: "rgba(59, 130, 246, 0.3)",
                  color: "#60A5FA",
                  boxShadow: "0 0 5px rgba(59, 130, 246, 0.2)",
                  transition: { duration: 0.15 },
                }}
                whileTap={{
                  scale: 0.98,
                  borderColor: "rgba(37, 99, 235, 0.4)",
                  backgroundColor: "rgba(37, 99, 235, 0.2)",
                }}>
                {getSearchTypeLabel()}
                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    isSearchTypeDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </motion.button>
              <AnimatePresence>
                {isSearchTypeDropdownOpen && (
                  <motion.div
                    className="absolute right-0 mt-2 sm:mt-3 w-36 sm:w-40
                                 bg-gradient-to-br from-gray-900 to-gray-800
                                 rounded-2xl
                                 border border-gray-700/50
                                 shadow-2xl
                                 z-30 flex flex-col overflow-hidden"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}>
                    
                    <div className="p-2 flex-grow">
                      <button
                        onClick={() => handleCategoryChange("movies")}
                        className={`w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-gray-300
                                     hover:bg-blue-900/20 hover:text-blue-300
                                     rounded-md transition-colors text-sm sm:text-base ${
                                       type === "movies"
                                         ? "bg-blue-800/30 text-blue-300 font-medium"
                                         : ""
                                     }`}>
                        Movies
                      </button>
                      <button
                        onClick={() => handleCategoryChange("tv")}
                        className={`w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-gray-300
                                     hover:bg-blue-900/20 hover:text-blue-300
                                     rounded-md transition-colors text-sm sm:text-base ${
                                       type === "tv"
                                         ? "bg-blue-800/30 text-blue-300 font-medium"
                                         : ""
                                     }`}>
                        TV Shows
                      </button>
                      <button
                        onClick={() => handleCategoryChange("people")}
                        className={`w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-gray-300
                                     hover:bg-blue-900/20 hover:text-blue-300
                                     rounded-md transition-colors text-sm ${
                                       type === "people"
                                         ? "bg-blue-800/30 text-blue-300 font-medium"
                                         : ""
                                     }`}>
                        People
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <button
            onClick={() => {
              setIsGenreModalOpen(true);
              setIsSearchTypeDropdownOpen(false);
              setActiveGenreTab(type === "movies" ? "movie" : "tv");
            }}
            className="hidden sm:flex items-center justify-between gap-1 sm:gap-2 px-4 sm:px-5 py-2 sm:py-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-sm sm:text-base text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            aria-label="Open genre selection modal">
            <span>Browse Genres</span>
            <ChevronDown size={16} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-xl sm:text-2xl text-white mb-6 font-medium">
            {query
              ? `Results for "${query}" in ${label}`
              : `Browse Popular ${label}`}
          </h3>

          <section className="flex flex-wrap items-center justify-center gap-3 md:gap-6 lg:gap-8">
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

            {!query && (
              <motion.div
                className="w-full text-center py-6 px-4 max-w-full mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}>
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="text-xs sm:text-sm font-light text-gray-500 mb-4 tracking-wide">
                  {getHintText()}
                </motion.p>

                <motion.h4
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="text-lg sm:text-xl font-medium text-white mb-6 tracking-tight">
                  {getHeadingText()}
                </motion.h4>

                {isDiscoverLoading ? (
                  <LoadingAnimation />
                ) : isDiscoverError ? (
                  <motion.div
                    className="w-full text-center py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}>
                    <p className="text-red-400 font-light text-base sm:text-lg">
                      Error fetching popular content: {discoverErrorMessage}
                    </p>
                  </motion.div>
                ) : discoverData.length > 0 ? (
                  <div className="flex flex-wrap items-start justify-center gap-3 md:gap-6 lg:gap-8">
                    {discoverData.map((item, index: number) => (
                      <motion.div
                        key={`${item.type}-discover-${item.id}-${index}`}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
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
                  </div>
                ) : (
                  <div className="w-full text-gray-500 text-sm mt-4 text-center">
                    No popular content available for this category.
                  </div>
                )}
              </motion.div>
            )}

            {query &&
              !isLoading &&
              results.length > 0 &&
              results.map((item, index: number) => (
                <motion.div
                  key={`${item.type}-${item.id}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}>
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
          </section>
        </div>
      </main>

      <AnimatePresence>
        {isGenreModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/10 backdrop-blur-md z-[888] hidden sm:flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsGenreModalOpen(false)}>
            <motion.div
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 shadow-2xl max-w-[384px] max-h-[80vh] flex flex-col"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}>
              <div className="relative p-6 flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">Select Genre</h3>
                <button
                  onClick={() => setIsGenreModalOpen(false)}
                  className="p-1.5 rounded-full text-gray-400 hover:bg-gray-700/50 hover:text-white transition-colors"
                  aria-label="Close modal">
                  <CloseIcon size={20} />
                </button>
              </div>

              <div className="px-6 pb-6 flex flex-col justify-center items-center gap-4 overflow-y-auto custom-scrollbar">
                <div className="flex w-[200px] bg-gray-700 rounded-full p-1">
                  <button
                    onClick={() => setActiveGenreTab("movie")}
                    className={`flex-1 py-2 px-3 text-center text-sm rounded-full transition-colors ${
                      activeGenreTab === "movie"
                        ? "bg-blue-600 text-white font-semibold shadow-md"
                        : "text-gray-300 hover:text-white"
                    }`}>
                    Movies
                  </button>
                  <button
                    onClick={() => setActiveGenreTab("tv")}
                    className={`flex-1 py-2 px-3 text-center text-sm rounded-full transition-colors ${
                      activeGenreTab === "tv"
                        ? "bg-blue-600 text-white font-semibold shadow-md"
                        : "text-gray-300 hover:text-white"
                    }`}>
                    TV Shows
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(activeGenreTab === "movie" ? movieGenresList : tvGenresList)
                    .length > 0 ? (
                    (activeGenreTab === "movie"
                      ? movieGenresList
                      : tvGenresList
                    ).map((genre) => (
                      <Link
                        key={genre.id}
                        to={`/${activeGenreTab}/$type/$typeName/$typeId`}
                        params={{
                          type: "with_genres",
                          typeName: genre.name,
                          typeId: String(genre.id),
                        }}
                        search={{ page: 1 }}
                        className={`block py-2 px-2 rounded-md text-sm text-center transition-colors text-gray-300 hover:bg-gray-700 hover:text-white`}
                        onClick={() => setIsGenreModalOpen(false)}>
                        {genre.name}
                      </Link>
                    ))
                  ) : (
                    <p className="col-span-full text-gray-400 text-center text-xs py-2">
                      No genres available.
                    </p>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-gray-700/50 flex justify-end items-center gap-3">
                <button
                  onClick={() => {
                    setIsGenreModalOpen(false);
                  }}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors text-sm shadow-md">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default Search;
