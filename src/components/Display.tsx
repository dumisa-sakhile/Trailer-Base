import { Link } from "@tanstack/react-router";
import React, {
  useRef,
  useState,
  useMemo,
  useCallback,
  Suspense,
  useEffect,
  memo,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { FixedSizeList } from "react-window";
import type { ListChildComponentProps } from "react-window";
import debounce from "lodash/debounce";
import { ErrorBoundary } from "react-error-boundary";
import {
  BookmarkPlus,
  BookmarkMinus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { auth, db } from "@/config/firebase";
import { collection, getDocs } from "firebase/firestore";
import  useBookmarkMutations  from "./useBookmarkMutations";
import { getMovieDetails } from "@/api/movie";

interface MovieProps {
  id: number;
  title: string;
  release_date: string;
  poster_path: string;
  vote_average: number;
  backdrop_path?: string;
  overview?: string;
  genre_ids?: number[];
}

interface DetailedMovieProps extends MovieProps {
  tagline?: string;
  runtime?: number;
  genres?: { id: number; name: string }[];
  original_language?: string;
  original_title?: string;
}

interface DisplayProps {
  data?: { results: MovieProps[] };
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  category: "movie" | "tv";
}

const ErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div className="text-red-500 text-center p-4">Error: {error.message}</div>
);

// Define item size as a constant
const ITEM_WIDTH = 140; // Card width
const ITEM_MARGIN = 10; // Margin between cards
const ITEM_SIZE = ITEM_WIDTH + ITEM_MARGIN; // Total size for FixedSizeList

// Custom hook to get window dimensions for responsiveness
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

// Skeleton loading component for a single movie card (improved colors)
const MovieCardSkeleton: React.FC<{ style: React.CSSProperties }> = ({
  style,
}) => (
  <div
    style={style}
    className="relative group inline-block animate-pulse rounded-md">
    <div
      className="w-[140px] h-[210px] bg-gradient-to-br from-neutral-200 via-neutral-300 to-neutral-100 dark:from-neutral-700 dark:via-neutral-800 dark:to-neutral-900 rounded-md"
      style={{ borderRadius: "0.375rem" }}>
      <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-white/20 to-transparent dark:from-neutral-900/80 dark:via-neutral-900/40 dark:to-transparent flex flex-col justify-end p-2 rounded-md">
        <div className="h-4 bg-neutral-300 dark:bg-neutral-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-neutral-200 dark:bg-neutral-600 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

const MovieCard: React.FC<{
  movie: MovieProps;
  index: number;
  style: React.CSSProperties;
  isSelected: boolean;
  onClick: (id: number) => void;
  bookmarks?: string[];
  category: "movie" | "tv";
}> = memo(
  ({ movie, index, style, isSelected, onClick, bookmarks, category }) => {
    const { addBookmarkMutation, removeBookmarkMutation } =
      useBookmarkMutations();

    return (
      <div style={style} className="relative group inline-block">
        <Suspense
          fallback={
            <MovieCardSkeleton
              style={{ width: `${ITEM_WIDTH}px`, height: "210px" }}
            />
          }>
          <button
            onClick={() => onClick(movie.id)}
            className={`w-[140px] h-[210px] overflow-hidden focus:outline-none rounded-md hover:scale-95 transition-transform duration-200 ${
              isSelected ? "border-2 border-blue-500" : ""
            }`}
            style={{ borderRadius: "0.375rem" }}>
            {movie.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                srcSet={`
                https://image.tmdb.org/t/p/w185${movie.poster_path} 185w,
                https://image.tmdb.org/t/p/w342${movie.poster_path} 342w
              `}
                sizes="(max-width: 640px) 185px, 342px"
                alt={movie.title || "Movie"}
                className="w-full h-full object-cover rounded-md"
                loading="lazy"
                style={{ borderRadius: "0.375rem" }}
              />
            ) : (
              <div
                className="w-full h-full bg-neutral-900 flex items-center justify-center rounded-md"
                style={{ borderRadius: "0.375rem" }}>
                <p className="text-neutral-500 text-sm">No poster</p>
              </div>
            )}
            {/* Show index and title by default, styled with shadow */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex flex-col justify-end p-2 rounded-md shadow-lg"
              style={{
                borderRadius: "0.375rem",
                boxShadow: "0 8px 32px 0 rgba(0,0,0,0.45)",
              }}>
              <h3 className="text-white text-xs font-semibold text-left line-clamp-2 geist-bold drop-shadow-lg">
                <span className="font-light text-lg  drop-shadow-lg">
                  {index + 1}
                </span>
                <span className="mx-1 text-white/70">•</span>
                <span className="drop-shadow-lg font-light">
                  {movie.title || "Unknown"}
                </span>
              </h3>
            </div>
          </button>
          {auth?.currentUser && (
            <div
              className="absolute top-1 left-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 will-change-opacity rounded-md"
              style={{ borderRadius: "0.375rem" }}>
              {bookmarks?.includes(movie.id.toString()) ? (
                <button
                  className="p-1 bg-[rgba(255,255,255,0.1)] rounded-full text-red-500 hover:bg-red-500 hover:text-white focus:ring-2 focus:ring-red-500/50 transition-all duration-200"
                  onClick={() =>
                    removeBookmarkMutation.mutate(movie.id.toString())
                  }
                  disabled={removeBookmarkMutation.isPending}
                  aria-label={`Remove ${movie.title || "Unknown"} from bookmarks`}>
                  <BookmarkMinus size={20} />
                </button>
              ) : (
                <button
                  className="p-1 bg-[rgba(255,255,255,0.1)] rounded-full text-white hover:bg-white hover:text-neutral-900 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  style={{
                    padding: "0.25rem",
                    width: "2rem",
                    height: "2rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={() =>
                    addBookmarkMutation.mutate({
                      id: movie.id,
                      title: movie.title,
                      poster_path: movie.poster_path,
                      vote_average: movie.vote_average,
                      release_date: movie.release_date,
                      category,
                    })
                  }
                  disabled={addBookmarkMutation.isPending || !movie.poster_path}
                  aria-label={`Add ${movie.title || "Unknown"} to bookmarks`}>
                  <BookmarkPlus size={20} />
                </button>
              )}
            </div>
          )}
        </Suspense>
      </div>
    );
  }
);

// Skeleton loading component for the main display area (improved colors)
const DisplaySkeleton: React.FC = () => {
  const { width: windowWidth } = useWindowSize();
  const visibleItems = Math.floor(windowWidth / ITEM_SIZE);

  return (
    <div className="relative w-full h-screen flex flex-col md:flex animate-pulse">
      {/* Featured Movie Background Skeleton (element only, not page) */}
      <div className="absolute left-0 top-0 w-full h-full pointer-events-none z-0">
        <div className="w-full h-full bg-gradient-to-br from-neutral-200 via-neutral-300 to-neutral-100 dark:from-neutral-700 dark:via-neutral-800 dark:to-neutral-900" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
      </div>

      {/* Featured Movie Content Skeleton */}
      <div className="relative flex-grow flex items-center justify-end z-10">
        <div className="absolute inset-0 flex flex-col items-start justify-end p-4 sm:p-6 lg:p-8 text-left max-w-2xl">
          <div className="h-10 bg-neutral-300 dark:bg-neutral-700 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-blue-400 dark:bg-blue-700 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-neutral-200 dark:bg-neutral-600 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-neutral-100 dark:bg-neutral-700 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-neutral-200 dark:bg-neutral-800 rounded w-full mb-4"></div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
            <div className="bg-blue-400 dark:bg-blue-700 rounded w-32 h-10"></div>
            <div className="bg-neutral-200 dark:bg-neutral-700 rounded w-10 h-10"></div>
          </div>
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3 mt-2"></div>
        </div>
      </div>

      {/* Scrollable Movie List Skeleton (element only, not page) */}
      <div className="w-full h-[230px] py-2 sm:py-4 z-20 flex overflow-hidden">
        <div className="absolute left-0 top-0 w-full h-full bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
        {Array.from({ length: visibleItems }).map((_, index) => (
          <MovieCardSkeleton
            key={index}
            style={{
              width: `${ITEM_WIDTH}px`,
              height: "210px",
              marginRight: `${ITEM_MARGIN}px`,
            }}
          />
        ))}
      </div>

      {/* Scroll Buttons Skeleton (element only, not page) */}
      <div className="absolute bottom-58 right-2 flex gap-2 z-20">
        <div className="bg-neutral-200 dark:bg-neutral-700 rounded-md p-2 sm:p-3.5 w-10 h-10"></div>
        <div className="bg-neutral-200 dark:bg-neutral-700 rounded-md p-2 sm:p-3.5 w-10 h-10"></div>
      </div>
    </div>
  );
};

const Display: React.FC<DisplayProps> = ({
  data,
  isLoading,
  isError,
  error,
  category,
}) => {
  const listRef = useRef<FixedSizeList>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const queryClient = useQueryClient();
  const { addBookmarkMutation, removeBookmarkMutation } =
    useBookmarkMutations();
  // Use a ref to avoid double render on initial mount
  const hasSetInitialFeatured = useRef(false);
  const [featuredMovieId, setFeaturedMovieId] = useState<number | null>(null);

  const { width: windowWidth } = useWindowSize(); // Get dynamic window width

  const otherMovies = useMemo(() => data?.results || [], [data?.results]);

  const { data: bookmarks } = useQuery<string[]>({
    queryKey: ["bookmarks", auth.currentUser?.uid],
    queryFn: async () => {
      if (!auth.currentUser) return [];
      const bookmarksRef = collection(
        db,
        "users",
        auth.currentUser.uid,
        "bookmarks"
      );
      const snapshot = await getDocs(bookmarksRef);
      return snapshot.docs.map((doc) => doc.id);
    },
    enabled: !!auth.currentUser,
  });

  const {
    data: featuredMovieDetails,
    isLoading: isDetailsLoading,
    error: detailsError,
  } = useQuery<DetailedMovieProps>({
    queryKey: ["movieDetails", featuredMovieId],
    queryFn: () => getMovieDetails(featuredMovieId?.toString() || ""),
    enabled: !!featuredMovieId,
  });

  const featuredMovie = useMemo(
    () =>
      otherMovies.find((movie) => movie.id === featuredMovieId) ||
      (data?.results?.length ? data.results[0] : null),
    [otherMovies, featuredMovieId, data?.results]
  );

  // Set default featured movie to the first in the list
  useEffect(() => {
    if (!hasSetInitialFeatured.current && otherMovies.length > 0) {
      setFeaturedMovieId(otherMovies[0].id);
      hasSetInitialFeatured.current = true;
    }
  }, [otherMovies]);

  // Calculate visible items and max scroll offset dynamically
  const visibleItems = Math.floor(windowWidth / ITEM_SIZE);
  const maxScrollOffset = Math.max(
    0,
    (otherMovies.length - visibleItems) * ITEM_SIZE
  );

  // Smooth scroll animation
  const smoothScrollTo = useCallback(
    (targetOffset: number, duration: number) => {
      const startOffset = scrollOffset;
      const startTime = performance.now();

      const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = progress * (2 - progress); // Ease-in-out
        const newOffset = Math.round(
          startOffset + (targetOffset - startOffset) * ease
        );

        if (listRef.current) {
          listRef.current.scrollTo(newOffset);
          setScrollOffset(newOffset);
        }

        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        }
      };

      requestAnimationFrame(animateScroll);
    },
    [scrollOffset]
  );

  // Debounced scroll functions with trailing: true (default)
  const scrollLeft = useMemo(
    () =>
      debounce(() => {
        if (listRef.current) {
          const currentIndex = Math.floor(scrollOffset / ITEM_SIZE);
          if (currentIndex <= 0) {
            const newOffset = Math.max(
              0,
              (otherMovies.length - visibleItems) * ITEM_SIZE
            );
            smoothScrollTo(newOffset, 500);
          } else {
            const newIndex = currentIndex - 1;
            const newOffset = newIndex * ITEM_SIZE;
            smoothScrollTo(newOffset, 500);
          }
        }
      }, 300),
    [scrollOffset, otherMovies.length, visibleItems, smoothScrollTo]
  );

  const scrollRight = useMemo(
    () =>
      debounce(() => {
        if (listRef.current) {
          const currentIndex = Math.floor(scrollOffset / ITEM_SIZE);
          const maxIndex = otherMovies.length - 1;
          if (currentIndex >= maxIndex - visibleItems + 1) {
            smoothScrollTo(0, 500);
          } else {
            const newIndex = currentIndex + 1;
            const newOffset = newIndex * ITEM_SIZE;
            smoothScrollTo(newOffset, 500);
          }
        }
      }, 300),
    [scrollOffset, otherMovies.length, visibleItems, smoothScrollTo]
  );

  const prefetchMovieDetails = useCallback(
    (id: number) => {
      queryClient.prefetchQuery({
        queryKey: ["movieDetails", id],
        queryFn: () => getMovieDetails(id.toString()),
      });
    },
    [queryClient]
  );

  const handleMovieClick = useMemo(
    () =>
      debounce((id: number) => {
        setFeaturedMovieId(id);
        const currentIndex = otherMovies.findIndex((m) => m.id === id);
        if (currentIndex >= 0) {
          [currentIndex - 1, currentIndex + 1]
            .filter((i) => i >= 0 && i < otherMovies.length)
            .forEach((i) => prefetchMovieDetails(otherMovies[i].id));
          const newOffset = Math.min(currentIndex * ITEM_SIZE, maxScrollOffset);
          smoothScrollTo(newOffset, 500);
        }
      }, 300),
    [otherMovies, prefetchMovieDetails, smoothScrollTo, maxScrollOffset]
  );

  const formatRuntime = useCallback((runtime?: number) => {
    if (!runtime) return "N/A";
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    return `${hours}h ${minutes}m`;
  }, []);

  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(date);
  }, []);

  const getFeaturedMovieIndex = useCallback(
    () => otherMovies.findIndex((movie) => movie.id === featuredMovieId) ?? -1,
    [otherMovies, featuredMovieId]
  );

  // Direct check for initial loading state
  if (isLoading || !featuredMovie) {
    return <DisplaySkeleton />;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <section
        className="relative  w-full h-screen bg-black text-white overflow-hidden hidden flex-col md:flex"
        style={{
          boxShadow:
            "inset 60px 0 60px -30px rgba(0,0,0,0.8), inset -60px 0 60px -30px rgba(0,0,0,0.8)",
        }}>
        {/* Featured Movie Background */}
        <Suspense
          fallback={
            <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center animate-pulse">
              <div className="h-full w-full bg-neutral-800"></div>
            </div>
          }>
          <div className="absolute inset-0 w-full h-full">
            {featuredMovie?.backdrop_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w1280${featuredMovie.backdrop_path}`}
                srcSet={`
                  https://image.tmdb.org/t/p/w780${featuredMovie.backdrop_path} 780w,
                  https://image.tmdb.org/t/p/w1280${featuredMovie.backdrop_path} 1280w
                `}
                sizes="(max-width: 1024px) 780px, 1280px"
                alt={featuredMovie.title || "Featured Movie"}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                <p className="text-neutral-400">No backdrop available</p>
              </div>
            )}
          </div>
        </Suspense>

        {/* Gradient Overlay (left to right for featured movie shadow) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent z-10" />

        {/* Featured Movie Content (Suspense boundary only for details) */}
        <div className="relative flex-grow flex items-center justify-end z-20">
          <Suspense
            fallback={
              <div className="absolute inset-0 flex flex-col items-start justify-end p-4 sm:p-6 lg:p-8 text-left max-w-2xl animate-pulse">
                <div className="h-10 bg-neutral-700 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-red-600 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-neutral-700 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-neutral-700 rounded w-1/3 mb-4"></div>
                <div className="h-20 bg-neutral-700 rounded w-full mb-4"></div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
                  <div className="bg-blue-600 rounded w-32 h-10"></div>
                  <div className="bg-neutral-700 rounded w-10 h-10"></div>
                </div>
                <div className="h-4 bg-neutral-700 rounded w-2/3 mt-2"></div>
              </div>
            }>
            {(featuredMovie || isDetailsLoading) && (
              <div className="absolute inset-0 flex flex-col items-start justify-end p-4 sm:p-6 lg:p-8 text-left max-w-2xl">
                <h3 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl geist-bold capitalize">
                  {featuredMovie?.title || "Unknown"}
                </h3>
                <p className="text-red-500 text-lg sm:text-xl md:text-2xl lg:text-3xl geist-bold capitalize mt-2">
                  {`Rank: ${getFeaturedMovieIndex() + 1}`}
                </p>
                <p className="text-neutral-200 text-sm sm:text-base md:text-lg mt-2">
                  {featuredMovieDetails?.tagline || "No tagline available"}
                </p>
                <p className="text-neutral-200 text-sm sm:text-base md:text-lg">
                  {formatDate(featuredMovieDetails?.release_date) ||
                    formatDate(featuredMovie?.release_date) ||
                    "N/A"}{" "}
                  • {formatRuntime(featuredMovieDetails?.runtime)} •{" "}
                  {featuredMovieDetails?.original_language?.toUpperCase() ||
                    "N/A"}
                </p>
                <p className="text-neutral-300 text-xs sm:text-sm max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mt-2">
                  {featuredMovieDetails?.overview ||
                    featuredMovie?.overview ||
                    "No overview available"}
                </p>
                {detailsError && (
                  <p className="text-red-500 text-sm mt-2">
                    Failed to load details
                  </p>
                )}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
                  <Link
                    to={category === "movie" ? "/movie/$movieId" : "/tv/$tvId"}
                    params={
                      category === "movie"
                        ? { movieId: featuredMovie?.id?.toString() || "" }
                        : { tvId: featuredMovie?.id?.toString() || "" }
                    }
                    className="bg-blue-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded hover:bg-blue-700 text-base sm:text-xl flex items-center justify-center focus:ring-2 focus:ring-blue-500">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 inline-block mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24">
                      <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.68L9.54 5.98C8.87 5.55 8 6.03 8 6.82z" />
                    </svg>
                    Watch Now
                  </Link>
                  {auth?.currentUser &&
                    (bookmarks?.includes(
                      featuredMovie?.id?.toString() || ""
                    ) ? (
                      <button
                        className="bg-red-600 text-white px-4 sm:px-4 py-2 sm:py-3 rounded hover:bg-red-700 text-base sm:text-xl flex items-center justify-center focus:ring-2 focus:ring-red-500"
                        style={{
                          minWidth: "2.5rem",
                          minHeight: "2.5rem",
                          padding: "0.5rem 1rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onClick={() =>
                          removeBookmarkMutation.mutate(
                            featuredMovie?.id?.toString() || ""
                          )
                        }
                        disabled={removeBookmarkMutation.isPending}
                        aria-label={`Remove ${
                          featuredMovie?.title || "Unknown"
                        } from bookmarks`}>
                        <BookmarkMinus size={20} />
                      </button>
                    ) : (
                      <button
                        className="bg-[#333]/50 backdrop-blur-md text-neutral-100 px-4 sm:px-5 py-2 sm:py-3 rounded hover:scale-95 text-base sm:text-xl flex items-center justify-center"
                        style={{
                          minWidth: "2.5rem",
                          minHeight: "2.5rem",
                          padding: "0.5rem 1rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onClick={() =>
                          addBookmarkMutation.mutate({
                            id: featuredMovie?.id || 0,
                            title: featuredMovie?.title || "",
                            poster_path: featuredMovie?.poster_path || "",
                            vote_average: featuredMovie?.vote_average || 0,
                            release_date: featuredMovie?.release_date || "",
                            category,
                          })
                        }
                        disabled={
                          addBookmarkMutation.isPending ||
                          !featuredMovie?.poster_path
                        }
                        aria-label={`Add ${
                          featuredMovie?.title || "Unknown"
                        } to bookmarks`}>
                        <BookmarkPlus size={20} />
                      </button>
                    ))}
                </div>
                <p className="text-neutral-200 text-xs sm:text-sm mt-2">
                  {featuredMovieDetails?.genres
                    ?.map((genre) => genre.name)
                    .join(" | ") || "N/A"}
                </p>
              </div>
            )}
          </Suspense>
        </div>

        {/* Scrollable Movie List (no suspense boundary here) */}
        <div className="w-full h-[230px] bg-gradient-to-t from-black via-black/50 to-transparent py-2 sm:py-4 z-20">
          {isError && (
            <p className="text-red-500 text-sm sm:text-base px-4 sm:px-6">
              Error:{" "}
              {error instanceof Error ? error.message : "An error occurred"}
            </p>
          )}
          {!isError && otherMovies.length > 0 ? (
            <FixedSizeList
              ref={listRef}
              height={220}
              width={windowWidth}
              itemCount={otherMovies.length}
              itemSize={ITEM_SIZE}
              layout="horizontal"
              className="px-4 sm:px-6">
              {({ index, style }: ListChildComponentProps) => (
                <div style={{ ...style, scrollSnapAlign: "start" }}>
                  <MovieCard
                    movie={otherMovies[index]}
                    index={index}
                    style={{ width: `${ITEM_WIDTH}px`, height: "210px" }}
                    isSelected={otherMovies[index].id === featuredMovieId}
                    onClick={handleMovieClick}
                    bookmarks={bookmarks}
                    category={category}
                  />
                </div>
              )}
            </FixedSizeList>
          ) : (
            <div className="flex overflow-hidden px-4 sm:px-6">
              {Array.from({ length: visibleItems }).map((_, index) => (
                <MovieCardSkeleton
                  key={index}
                  style={{
                    width: `${ITEM_WIDTH}px`,
                    height: "210px",
                    marginRight: `${ITEM_MARGIN}px`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Scroll Buttons */}
        <div className="absolute bottom-58 right-2 flex gap-2 z-20">
          <button
            onClick={scrollLeft}
            aria-label="Scroll Left"
            className="bg-[rgba(255,255,255,0.1)] rounded-md p-2 sm:p-3.5 opacity-30 hover:opacity-80 hover:bg-blue-900/20 hover:scale-105 transition-all duration-200 will-change-transform ring-1 ring-blue-400/10 focus:ring-2 focus:ring-blue-500/50">
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={scrollRight}
            aria-label="Scroll Right"
            className="bg-[rgba(255,255,255,0.1)] rounded-md p-2 sm:p-3.5 opacity-30 hover:opacity-80 hover:bg-blue-900/20 hover:scale-105 transition-all duration-200 will-change-transform ring-1 ring-blue-400/10 focus:ring-2 focus:ring-blue-500/50">
            <ChevronRight size={20} />
          </button>
        </div>
      </section>
    </ErrorBoundary>
  );
};

export default Display;
