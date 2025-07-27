import {
  createFileRoute,
  Link,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { searchMovies, discoverMovies } from "@/api/movie";
import { searchTV, discoverTV } from "@/api/tv";
import { searchPerson, getTrendingPeople } from "@/api/people";
import MediaCard from "@/components/MediaCard"; // Ensure this path is correct
import CastCard from "@/components/PeopleCastCard"; // Ensure this path is correct
import movieGenres from "@/data/movieGenres";
import tvGenres from "@/data/tvGenres";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search as SearchIconLucide,
  ChevronDown,
  Frown,
  X,
} from "lucide-react";

// Define the route for the search page
export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, string>) => ({
    query: search.query || "",
    type: search.type || "movies", // Default search type
    page: search.page ? parseInt(search.page) : 1, // Default page
  }),
  component: Search,
});

// Unified interface for search results to render either MediaCard or CastCard
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

// Interface for genre objects
interface Genre {
  id: number;
  name: string;
}

// --- Utility Hook ---

// Custom hook to get window dimensions for responsive skeleton calculations
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

// --- Skeleton Components ---

// Defines the dimensions for MediaCard and CastCard for accurate skeleton sizing
const MEDIA_CARD_WIDTH_DESKTOP = 260;

const MEDIA_CARD_WIDTH_MOBILE = 120;


const CAST_CARD_WIDTH = 150; // Based on the parent motion.div width in People/Search


const CARD_GAP_MD = 24; // md:gap-6

/**
 * SearchCardSkeleton Component
 * Renders a skeleton placeholder for either a movie/TV show card or a person card.
 * It dynamically adjusts its appearance based on the `type` prop.
 */
interface SearchCardSkeletonProps {
  type: "movie" | "tv" | "person";
}

const SearchCardSkeleton: React.FC<SearchCardSkeletonProps> = ({ type }) => {
  if (type === "person") {
    // Skeleton for a person (CastCard-like)
    return (
      <div
        className="flex flex-col items-center text-center animate-pulse flex-shrink-0
                      rounded-lg p-4 bg-neutral-800"
        style={{ width: `${CAST_CARD_WIDTH}px` }}>
        {/* Profile image placeholder */}
        <div className="w-24 h-24 bg-neutral-700 rounded-full mb-2"></div>
        {/* Name placeholder */}
        <div className="h-4 bg-neutral-600 rounded w-3/4 mb-1"></div>
        {/* Role/Department placeholder */}
        <div className="h-3 bg-neutral-600 rounded w-1/2"></div>
      </div>
    );
  } else {
    // Skeleton for a movie or TV show (MediaCard-like)
    return (
      <div
        className="relative w-[260px] h-[390px] max-sm:w-[120px] max-sm:h-[180px]
                      bg-neutral-800 rounded-2xl animate-pulse overflow-hidden">
        {/* Image area placeholder */}
        <div className="absolute inset-0 bg-neutral-700"></div>
        {/* Content overlay placeholder */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/40 to-transparent
                        flex flex-col justify-end p-4 max-sm:p-2">
          {/* Rating/Year placeholder */}
          <div className="h-4 w-1/3 bg-neutral-600 rounded mb-2 max-sm:h-3 max-sm:w-1/2"></div>
          {/* Title line 1 placeholder */}
          <div className="h-5 w-3/4 bg-neutral-600 rounded mb-1 max-sm:h-4 max-sm:w-2/3"></div>
          {/* Title line 2 placeholder */}
          <div className="h-5 w-1/2 bg-neutral-600 rounded max-sm:h-4 max-sm:w-1/2"></div>
        </div>
        {/* Bookmark button placeholder */}
        <div className="absolute top-3 left-3 p-2 bg-neutral-700 rounded-full shadow-md max-sm:p-1.5 max-sm:top-2 max-sm:left-2">
          <div className="w-5 h-5 bg-neutral-600 rounded-full max-sm:w-4 max-sm:h-4"></div>
        </div>
      </div>
    );
  }
};

/**
 * SearchResultsSkeleton Component
 * Renders a grid of `SearchCardSkeleton` components to serve as a loading placeholder
 * for the main search results section.
 */
interface SearchResultsSkeletonProps {
  type: "movies" | "tv" | "people";
}

const SearchResultsSkeleton: React.FC<SearchResultsSkeletonProps> = ({
  type,
}) => {
  const { width: windowWidth } = useWindowSize();

  let cardWidth = MEDIA_CARD_WIDTH_DESKTOP;
  let cardGap = CARD_GAP_MD; // Default gap-6
  let horizontalPadding = 24 * 2; // px-6

  if (type === "people") {
    cardWidth = CAST_CARD_WIDTH;
  }

  // Adjust for mobile screens
  if (windowWidth < 640) {
    cardWidth = type === "people" ? CAST_CARD_WIDTH : MEDIA_CARD_WIDTH_MOBILE;
    cardGap = 16; // gap-4
    horizontalPadding = 16 * 2; // px-4
  }

  // Calculate how many skeletons can fit in the available width
  const effectiveWidth = Math.max(0, windowWidth - horizontalPadding);
  const cardsPerRow = Math.floor(effectiveWidth / (cardWidth + cardGap));
  // Render enough skeletons to fill at least 3 rows, with a minimum of 9 cards
  const numberOfSkeletons = Math.max(cardsPerRow * 3, 9);

  // Determine the type of skeleton card to render
  const skeletonType =
    type === "movies" ? "movie" : type === "tv" ? "tv" : "person";

  return (
    <div className="w-full flex flex-wrap justify-center gap-6 md:gap-8">
      {Array.from({ length: numberOfSkeletons }).map((_, index) => (
        <SearchCardSkeleton key={index} type={skeletonType} />
      ))}
    </div>
  );
};

// --- Main Search Component ---
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

  // Sync internal input value with URL query param
  useEffect(() => {
    setInputValue(query);
  }, [query]);

  // Close dropdowns/popups when clicking outside
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

  // Base query options for search
  const queryOptions = {
    queryKey: ["search", query, page, type],
    enabled: !!query, // Only enable if there's a query string
  };

  // Movie search query
  const movieQuery = useQuery({
    ...queryOptions,
    queryFn: () => searchMovies(page, query),
    enabled: queryOptions.enabled && type === "movies",
    placeholderData: keepPreviousData,
  });

  // TV show search query
  const tvQuery = useQuery({
    ...queryOptions,
    queryFn: () => searchTV(page, query),
    enabled: queryOptions.enabled && type === "tv",
    placeholderData: keepPreviousData,
  });

  // Person search query
  const personQuery = useQuery({
    ...queryOptions,
    queryFn: () => searchPerson(page, query),
    enabled: queryOptions.enabled && type === "people",
    placeholderData: keepPreviousData,
  });

  // Discover movies query (for initial browse state)
  const discoverMoviesQuery = useQuery({
    queryKey: ["discoverMovies"],
    queryFn: () => discoverMovies(),
    enabled: !query && type === "movies", // Only enable if no query and type is movies
    staleTime: 1000 * 60 * 60, // Stale after 1 hour
  });

  // Discover TV shows query (for initial browse state)
  const discoverTvQuery = useQuery({
    queryKey: ["discoverTv"],
    queryFn: () => discoverTV(),
    enabled: !query && type === "tv", // Only enable if no query and type is tv
    staleTime: 1000 * 60 * 60,
  });

  // Trending people query (for initial browse state)
  const trendingPeopleQuery = useQuery({
    queryKey: ["trendingPeople"],
    queryFn: () => getTrendingPeople("day", 1),
    enabled: !query && type === "people", // Only enable if no query and type is people
    staleTime: 1000 * 60 * 60,
  });

  // Consolidate search results based on current type
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
      .filter((item: any) => item?.poster_path || item?.profile_path) // Filter out items without images
      .map((item: any) => {
        if (itemType === "person") {
          return {
            id: item.id?.toString() ?? "",
            name: item.name ?? "Unknown Person",
            profile_path:
              item.profile_path ??
              "https://placehold.co/500x750/333333/FFFFFF?text=No+Image", // Fallback image
            type: "person",
            url: `/people/${item.id ?? "#"}`,
          } as SearchCardUnifiedProps;
        } else {
          return {
            id: item.id?.toString() ?? "",
            title: itemType === "movie" ? item.title : item.name,
            poster_path:
              item.poster_path ??
              "https://placehold.co/500x750/333333/FFFFFF?text=No+Image", // Fallback image
            release_date: item.release_date ?? item.first_air_date ?? "N/A",
            vote_average: item.vote_average ?? 0,
            type: itemType,
            url: `/${itemType === "movie" ? "movie" : "tv"}/${item.id ?? "#"}`,
          } as SearchCardUnifiedProps;
        }
      });
  })();

  // Consolidate discover/trending data for initial browse state
  const discoverData: SearchCardUnifiedProps[] = (() => {
    if (!query) {
      // Only show discover data if no search query is active
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

  // Determine overall loading state
  const isLoading =
    type === "movies"
      ? movieQuery.isLoading
      : type === "tv"
        ? tvQuery.isLoading
        : personQuery.isLoading;

  // Determine overall error state
  const isError =
    type === "movies"
      ? movieQuery.isError
      : type === "tv"
        ? tvQuery.isError
        : personQuery.isError;

  // Get specific error message
  const errorMessage =
    type === "movies"
      ? (movieQuery.error as Error)?.message
      : type === "tv"
        ? (tvQuery.error as Error)?.message
        : (personQuery.error as Error)?.message;

  // Label for current search type (e.g., "Movies", "TV Shows", "People")
  const label =
    type === "movies" ? "Movies" : type === "tv" ? "TV Shows" : "People";

  // Genre lists for movies and TV shows
  const movieGenresList: Genre[] = movieGenres();
  const tvGenresList: Genre[] = tvGenres();
  const currentGenreList = type === "movies" ? movieGenresList : tvGenresList;

  // Debounce input value to trigger navigation after a delay
  useEffect(() => {
    const handler = setTimeout(() => {
      if (inputValue !== query) {
        navigate({
          to: "/search",
          search: { query: inputValue, type, page: 1 },
        });
      }
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, type, navigate, query]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Handle category (search type) change
  const handleCategoryChange = (newType: "movies" | "tv" | "people") => {
    navigate({
      to: "/search",
      search: { query: "", type: newType, page: 1 }, // Reset query when changing type
    });
    setIsSearchTypeDropdownOpen(false); // Close dropdown
    if (newType === "people") {
      setIsGenrePopupOpen(false); // Close genre popup if switching to people
    }
  };

  // Helper to get the label for the search type button
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

  // Helper to get the text for the genre button
  const getGenreButtonText = () => {
    if (type === "movies") {
      return " Movie Genres";
    } else if (type === "tv") {
      return " TV Show Genres";
    }
    return " Genres"; // Should not happen if type is strictly movies/tv/people
  };

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
              className="w-full h-14 px-5 py-3 rounded-full bg-[#242424] border border-[#141414] text-base text-white placeholder:text-white pl-14 pr-36 leading-6 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all font-normal shadow-lg"
              aria-label={`Search ${label.toLowerCase()}`}
            />
            <span className="absolute left-5 top-1/2 -translate-y-1/2">
              <SearchIconLucide size={20} className="text-neutral-400" />
            </span>

            <div
              ref={searchTypeDropdownRef}
              className="absolute right-3 top-1/2 -translate-y-1/2">
              <motion.button
                onClick={() => {
                  setIsSearchTypeDropdownOpen(!isSearchTypeDropdownOpen);
                  setIsGenrePopupOpen(false); // Close genre popup when opening search type dropdown
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
                      className={`flex items-center justify-between w-full text-left px-4 py-3 text-neutral-300 hover:text-blue-300 rounded-lg transition-colors text-base font-medium ${
                        type === "movies" ? "text-blue-300" : ""
                      }`}>
                      Movies
                      {type === "movies" && (
                        <svg
                          className="w-4 h-4 text-blue-400"
                          fill="currentColor"
                          viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"></path>
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => handleCategoryChange("tv")}
                      className={`flex items-center justify-between w-full text-left px-4 py-3 text-neutral-300 hover:text-blue-300 rounded-lg transition-colors text-base font-medium ${
                        type === "tv" ? "text-blue-300" : ""
                      }`}>
                      TV Shows
                      {type === "tv" && (
                        <svg
                          className="w-4 h-4 text-blue-400"
                          fill="currentColor"
                          viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"></path>
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => handleCategoryChange("people")}
                      className={`flex items-center justify-between w-full text-left px-4 py-3 text-neutral-300 hover:text-blue-300 rounded-lg transition-colors text-base font-medium ${
                        type === "people" ? "text-blue-300" : ""
                      }`}>
                      People
                      {type === "people" && (
                        <svg
                          className="w-4 h-4 text-blue-400"
                          fill="currentColor"
                          viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"></path>
                        </svg>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Genre selection button and popup (only for movies/tv) */}
          {(type === "movies" || type === "tv") && (
            <div className="relative">
              <button
                ref={genreButtonRef}
                onClick={() => {
                  setIsGenrePopupOpen(!isGenrePopupOpen);
                  setIsSearchTypeDropdownOpen(false); // Close search type dropdown when opening genre popup
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
                            className="block w-full text-left px-4 py-2 rounded-lg hover:bg-blue-600 text-white text-sm font-medium transition-color cursor-pointer"
                            onClick={() => setIsGenrePopupOpen(false)}>
                            {genre.name}
                          </Link>
                        ))
                      ) : (
                        <p className="text-neutral-400 text-sm text-center py-4">
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
          {/* Section title for results or popular content */}
          <h3 className="text-xl sm:text-2xl text-white mb-6 font-semibold border-b border-neutral-800 pb-3">
            {query
              ? `Results for "${query}" in ${label}`
              : `Browse Popular ${label}`}
          </h3>

          <section className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
            {isLoading ? (
              // Show skeleton when content is loading
              <SearchResultsSkeleton
                type={type as "movies" | "tv" | "people"}
              />
            ) : isError ? (
              // Show error message if data fetching failed
              <motion.div
                className="w-full text-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}>
                <p className="text-red-400 font-light text-base sm:text-lg">
                  Error: {errorMessage}
                </p>
              </motion.div>
            ) : (
              // Render actual results or discover data
              <>
                {/* Display results if query is present, otherwise display discover data */}
                {(query ? results : discoverData).length > 0
                  ? (query ? results : discoverData).map(
                      (item, index: number) => (
                        <motion.div
                          key={`${item.type}-${item.id}-${index}`}
                          initial={{ opacity: 0, scale: 0.95, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.05 * index }}>
                          {item.type === "person" ? (
                            <CastCard
                              id={Number(item.id)}
                              name={item.name}
                              profile_path={item.profile_path ?? undefined}
                              character="Actor" // Default character if not available
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
                      )
                    )
                  : // Message when no results are found for a query
                    query &&
                    results.length === 0 && (
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
                          <Frown size={48} className="text-neutral-400 mb-4" />
                        </motion.div>
                        <p className="text-xl sm:text-2xl font-light text-neutral-300 mb-2">
                          No {label.toLowerCase()} found for "{query}"
                        </p>
                        <p className="text-sm sm:text-base text-neutral-500">
                          Try a different search term or check your spelling
                        </p>
                      </motion.div>
                    )}

                {/* Message for no popular content when no query is active */}
                {!query && discoverData.length === 0 && (
                  <div className="w-full text-neutral-500 text-sm mt-4 text-center">
                    No popular content available for this category.
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </section>
  );
}

export default Search;
