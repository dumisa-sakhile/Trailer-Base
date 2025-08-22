import {
  createFileRoute,
  Link,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { searchMovies, discoverMovies } from "@/api/movie";
import { searchTV, discoverTV } from "@/api/tv";
import { searchPerson, getTrendingPeople } from "@/api/people";
import MediaCard from "@/components/MediaCard";
import CastCard from "@/components/PeopleCastCard";
import movieGenres from "@/data/movieGenres";
import tvGenres from "@/data/tvGenres";
import { motion, AnimatePresence } from "framer-motion";
import type { PanInfo } from "framer-motion";
import { Search as SearchIconLucide, ChevronDown, Frown } from "lucide-react";

// Route and Interfaces remain the same
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

// --- Utility Hooks & Skeleton Components ---
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

const MEDIA_CARD_WIDTH_DESKTOP = 260;
const MEDIA_CARD_WIDTH_MOBILE = 120;
const CAST_CARD_WIDTH = 150;
const CARD_GAP_MD = 24;

interface SearchCardSkeletonProps {
  type: "movie" | "tv" | "person";
}

const SearchCardSkeleton: React.FC<SearchCardSkeletonProps> = ({ type }) => {
  if (type === "person") {
    return (
      <div
        className="flex flex-col items-center text-center animate-pulse flex-shrink-0 rounded-lg p-4 bg-neutral-800"
        style={{ width: `${CAST_CARD_WIDTH}px` }}>
        <div className="w-24 h-24 bg-neutral-700 rounded-full mb-2"></div>
        <div className="h-4 bg-neutral-600 rounded w-3/4 mb-1"></div>
        <div className="h-3 bg-neutral-600 rounded w-1/2"></div>
      </div>
    );
  } else {
    return (
      <div className="relative w-[260px] h-[390px] max-sm:w-[120px] max-sm:h-[180px] bg-neutral-800 rounded-2xl animate-pulse overflow-hidden">
        <div className="absolute inset-0 bg-neutral-700"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/40 to-transparent flex flex-col justify-end p-4 max-sm:p-2">
          <div className="h-4 w-1/3 bg-neutral-600 rounded mb-2 max-sm:h-3 max-sm:w-1/2"></div>
          <div className="h-5 w-3/4 bg-neutral-600 rounded mb-1 max-sm:h-4 max-sm:w-2/3"></div>
          <div className="h-5 w-1/2 bg-neutral-600 rounded max-sm:h-4 max-sm:w-1/2"></div>
        </div>
        <div className="absolute top-3 left-3 p-2 bg-neutral-700 rounded-full shadow-md max-sm:p-1.5 max-sm:top-2 max-sm:left-2">
          <div className="w-5 h-5 bg-neutral-600 rounded-full max-sm:w-4 max-sm:h-4"></div>
        </div>
      </div>
    );
  }
};

interface SearchResultsSkeletonProps {
  type: "movies" | "tv" | "people";
}

const SearchResultsSkeleton: React.FC<SearchResultsSkeletonProps> = ({
  type,
}) => {
  const { width: windowWidth } = useWindowSize();
  let cardWidth = MEDIA_CARD_WIDTH_DESKTOP;
  let cardGap = CARD_GAP_MD;
  let horizontalPadding = 24 * 2;
  if (type === "people") {
    cardWidth = CAST_CARD_WIDTH;
  }
  if (windowWidth < 640) {
    cardWidth = type === "people" ? CAST_CARD_WIDTH : MEDIA_CARD_WIDTH_MOBILE;
    cardGap = 16;
    horizontalPadding = 16 * 2;
  }
  const effectiveWidth = Math.max(0, windowWidth - horizontalPadding);
  const cardsPerRow = Math.floor(effectiveWidth / (cardWidth + cardGap));
  const numberOfSkeletons = Math.max(cardsPerRow * 3, 9);
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

// --- Mobile-specific Bottom Drawer Component ---
interface BottomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children: React.ReactNode;
}

const BottomDrawer: React.FC<BottomDrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const dragHandlers = {
    onDragStart: (_event: MouseEvent | TouchEvent, info: PanInfo) => {
      startY.current = info.point.y;
    },
    onDragEnd: (_event: MouseEvent | TouchEvent, info: PanInfo) => {
      const draggedDistance = info.point.y - startY.current;
      const threshold = (drawerRef.current?.offsetHeight || 0) * 0.2;
      if (draggedDistance > threshold) {
        onClose();
      }
    },
  };
  return isOpen
    ? ReactDOM.createPortal(
        <AnimatePresence>
          <>
            <motion.div
              className="fixed inset-0 bg-black/70 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.div
              ref={drawerRef}
              className="fixed inset-x-0 bottom-0 z-[100] rounded-t-2xl bg-[#181a20] shadow-[0_-8px_32px_0_rgba(0,0,0,0.45)] flex flex-col max-h-[90vh] overflow-hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 180 }}
              drag="y"
              dragElastic={0.18}
              dragMomentum={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              {...dragHandlers}>
              <div className="flex flex-col items-center pt-3 pb-2 cursor-grab touch-none select-none">
                <div className="w-12 h-1.5 rounded-full bg-neutral-600 mb-2 shadow-md border border-neutral-500" />
              </div>
              <div className="w-full  p-6 pt-0 ">
                <div className="flex items-center justify-center">
                  <div className="flex flex-col items-center justify-center ">
                    <h2 className="text-2xl font-semibold text-white">
                      {title}
                    </h2>
                    <p className="text-sm text-neutral-400 mt-1">
                      {description}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6 text-sm">
                {children}
              </div>
            </motion.div>
          </>
        </AnimatePresence>,
        document.body
      )
    : null;
};

// --- Desktop-specific Modal Component (Refined) ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
}) => {
  return isOpen
    ? ReactDOM.createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              className="absolute inset-0 bg-black/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.div
              className="relative rounded-2xl bg-[#1a1a1a] shadow-2xl flex flex-col max-h-[90vh] w-full max-w-md border border-neutral-800 z-[100]"
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}>
              <div className="flex flex-col items-center pt-3 pb-2 cursor-default">
                <div className="w-10 h-1.5 rounded-full bg-neutral-500 mb-2" />
              </div>
              <div className="p-6 pt-0 text-center">
                <div className="flex flex-col items-center justify-center">
                  <h2 className="text-2xl font-semibold text-white">{title}</h2>
                  <p className="text-sm text-neutral-400 mt-1">{description}</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6">
                {children}
              </div>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )
    : null;
};

// --- Main Search Component ---
function Search() {
  const navigate = useNavigate();
  const { query, page, type } = useSearch({ from: "/search" });
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const [isSearchTypeDropdownOpen, setIsSearchTypeDropdownOpen] =
    useState(false);
  const searchTypeDropdownRef = useRef<HTMLDivElement>(null);
  const [isGenreDrawerOpen, setIsGenreDrawerOpen] = useState(false);
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
    };
    document.addEventListener("mousedown", handleClickOutside);
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
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
  const tvQuery = useQuery({
    ...queryOptions,
    queryFn: () => searchTV(page, query),
    enabled: queryOptions.enabled && type === "tv",
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
  const personQuery = useQuery({
    ...queryOptions,
    queryFn: () => searchPerson(page, query),
    enabled: queryOptions.enabled && type === "people",
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 60, // 1 hour
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
    let rawData;
    let itemType: "movie" | "tv" | "person";
    if (type === "movies") {
      rawData = query
        ? movieQuery.data?.results
        : discoverMoviesQuery.data?.results;
      itemType = "movie";
    } else if (type === "tv") {
      rawData = query ? tvQuery.data?.results : discoverTvQuery.data?.results;
      itemType = "tv";
    } else if (type === "people") {
      rawData = query
        ? personQuery.data?.results
        : trendingPeopleQuery.data?.results;
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
  const isLoading =
    type === "movies"
      ? movieQuery.isLoading || (query === "" && discoverMoviesQuery.isLoading)
      : type === "tv"
        ? tvQuery.isLoading || (query === "" && discoverTvQuery.isLoading)
        : personQuery.isLoading ||
          (query === "" && trendingPeopleQuery.isLoading);
  const isError =
    type === "movies"
      ? movieQuery.isError || (query === "" && discoverMoviesQuery.isError)
      : type === "tv"
        ? tvQuery.isError || (query === "" && discoverTvQuery.isError)
        : personQuery.isError || (query === "" && trendingPeopleQuery.isError);
  const errorMessage = isError ? "An error occurred while fetching data." : "";
  const label =
    type === "movies" ? "Movies" : type === "tv" ? "TV Shows" : "People";
  const currentGenreList = type === "movies" ? movieGenres() : tvGenres();
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
    setIsGenreDrawerOpen(false);
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

  const modalOrDrawerContent = (
    <div className="flex flex-row flex-wrap gap-2 justify-center items-center poppins-light">
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
            className="px-4 py-2 rounded-lg text-neutral-300 transition-colors font-normal hover:font-bold focus:font-bold whitespace-nowrap"
            style={{ background: "none" }}
            onClick={() => setIsGenreDrawerOpen(false)}>
            {genre.name}
          </Link>
        ))
      ) : (
        <p className="text-neutral-500 text-center">No genres found.</p>
      )}
    </div>
  );
  return (
    <section className="min-h-screen text-white flex flex-col poppins-light">
      <header className="py-6 md:p-8 flex flex-col gap-6 sm:gap-8 z-10">
        <h1 className="text-4xl lg:text-5xl text-white text-center font-extrabold tracking-tight">
          Discover Your Next Favorite
        </h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 w-full max-w-5xl mx-auto px-4">
          <div className="relative flex-grow">
            <input
              autoFocus
              type="search"
              placeholder={`Search ${label.toLowerCase()}`}
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
                  setIsGenreDrawerOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 border border-blue-700 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-lg hover:bg-blue-700 hover:border-blue-800"
                aria-label="Toggle search type dropdown"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}>
                <span className="pr-1">{getSearchTypeLabel()}</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${isSearchTypeDropdownOpen ? "rotate-180" : ""}`}
                />
              </motion.button>
              <AnimatePresence>
                {isSearchTypeDropdownOpen && (
                  <motion.div
                    className="absolute right-0 mt-2 min-w-[140px] max-w-[80vw] bg-[#181a20] rounded-2xl border border-white/10 shadow-[0_4px_32px_0_rgba(0,0,0,0.45)] z-30 flex flex-col overflow-hidden py-1.5 px-0.5"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}>
                    <button
                      onClick={() => handleCategoryChange("movies")}
                      className="flex items-center gap-2 w-full text-left px-4 py-3 rounded-lg transition-all text-base font-medium mb-1 text-neutral-300  hover:text-white"
                      style={{
                        position: "relative",
                        fontWeight: type === "movies" ? 600 : 400,
                      }}>
                      <span>Movies</span>
                      {type === "movies" && (
                        <svg
                          className="ml-auto text-blue-500"
                          width="20"
                          height="20"
                          fill="none"
                          viewBox="0 0 24 24">
                          <path
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => handleCategoryChange("tv")}
                      className="flex items-center gap-2 w-full text-left px-4 py-3 rounded-lg transition-all text-base font-medium mb-1 text-neutral-300 hover:text-white"
                      style={{
                        position: "relative",
                        fontWeight: type === "tv" ? 600 : 400,
                      }}>
                      <span>TV Shows</span>
                      {type === "tv" && (
                        <svg
                          className="ml-auto text-blue-500"
                          width="20"
                          height="20"
                          fill="none"
                          viewBox="0 0 24 24">
                          <path
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => handleCategoryChange("people")}
                      className="flex items-center gap-2 w-full text-left px-4 py-3 rounded-lg transition-all text-base font-medium text-neutral-300 hover:text-white"
                      style={{
                        position: "relative",
                        fontWeight: type === "people" ? 600 : 400,
                      }}>
                      <span>People</span>
                      {type === "people" && (
                        <svg
                          className="ml-auto text-blue-500"
                          width="20"
                          height="20"
                          fill="none"
                          viewBox="0 0 24 24">
                          <path
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          {/* Mobile genre button */}
          {(type === "movies" || type === "tv") && (
            <button
              type="button"
              className="sm:hidden flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#242424] border border-[#141414] text-base text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 w-full hover:bg-neutral-700 hover:border-blue-500 transition-colors shadow-lg"
              aria-label="Open genre selection drawer"
              onClick={() => {
                setIsGenreDrawerOpen(true);
                setIsSearchTypeDropdownOpen(false);
              }}>
              <span>{`Browse ${type === "movies" ? "Movie" : "TV Show"} Genres`}</span>
              <ChevronDown size={18} />
            </button>
          )}
          {(type === "movies" || type === "tv") && (
            <div className="relative">
              <button
                onClick={() => {
                  setIsGenreDrawerOpen(true);
                  setIsSearchTypeDropdownOpen(false);
                }}
                className="hidden sm:flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#242424] border border-[#141414] text-base text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto hover:bg-neutral-700 hover:border-blue-500 transition-colors shadow-lg"
                aria-label="Open genre selection drawer">
                <span>{`Browse ${
                  type === "movies" ? "Movie" : "TV Show"
                } Genres`}</span>
                <ChevronDown size={18} />
              </button>
            </div>
          )}
        </div>
      </header>
      {(type === "movies" || type === "tv") &&
        (isMobile ? (
          <BottomDrawer
            isOpen={isGenreDrawerOpen}
            onClose={() => setIsGenreDrawerOpen(false)}
            title={`Browse ${type === "movies" ? "Movie" : "TV Show"} Genres`}
            description="Find movies and TV shows by genre.">
            {modalOrDrawerContent}
          </BottomDrawer>
        ) : (
          <Modal
            isOpen={isGenreDrawerOpen}
            onClose={() => setIsGenreDrawerOpen(false)}
            title={`Browse ${type === "movies" ? "Movie" : "TV Show"} Genres`}
            description="Find movies and TV shows by genre.">
            {modalOrDrawerContent}
          </Modal>
        ))}
      <main className="-mt-10 md:mt-0 flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 py-8 poppins-light">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-lg text-white mb-6 font-semibold border-b border-neutral-800 pb-3">
            {query
              ? `Results for "${query}" in ${label}`
              : `Here are some popular ${label.toLowerCase()} you might enjoy!`}
          </h3>
          <section className="flex  flex-wrap items-center justify-center gap-6">
            {isLoading ? (
              <SearchResultsSkeleton
                type={type as "movies" | "tv" | "people"}
              />
            ) : isError ? (
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
              <>
                {results.length > 0
                  ? results.map(
                      (item: SearchCardUnifiedProps, index: number) => (
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
                              character="Actor"
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
                  : query && (
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
                {!query && results.length === 0 && (
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
