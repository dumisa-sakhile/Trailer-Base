import { Link } from "@tanstack/react-router";
import React, {
  useRef,
  useState,
  useMemo,
  useCallback,
  Suspense,
  useEffect,
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
import useBookmarkMutations from "./useBookmarkMutations";
import { getTVDetails } from "@/api/tv";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface TVProps {
  id: number;
  name: string;
  release_date: string;
  poster_path: string;
  vote_average: number;
  backdrop_path?: string;
  overview?: string;
  genre_ids?: number[];
}

interface DetailedTVProps extends TVProps {
  tagline?: string;
  episode_run_time?: number[];
  genres?: { id: number; name: string }[];
  original_language?: string;
  original_name?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  first_air_date?: string;
  last_episode_to_air?: {
    id: number;
    name: string;
    overview: string;
    vote_average: number;
    vote_count: number;
    air_date: string;
    episode_number: number;
    episode_type: string;
    production_code: string;
    runtime: number;
    season_number: number;
    show_id: number;
    still_path: string;
  };
}

interface DisplayProps {
  data?: { results: TVProps[] };
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  category: "tv";
}

const ErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div className="text-red-500 text-center p-4">Error: {error.message}</div>
);

// Define item size as a constant
const ITEM_WIDTH = 140;
const ITEM_MARGIN = 10;
const ITEM_SIZE = ITEM_WIDTH + ITEM_MARGIN;

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

// Skeleton loading component for a single TV show card
const TVCardSkeleton: React.FC<{ style: React.CSSProperties }> = React.memo(
  ({ style }) => (
    <div style={style} className="flex-shrink-0">
      <div className="relative w-[140px] h-[210px] rounded-md overflow-hidden">
        <Card className="w-full h-full rounded-md border-0 bg-neutral-800 p-0">
          <CardContent className="p-0 w-full h-full">
            <Skeleton className="w-full h-full rounded-md bg-neutral-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex flex-col justify-end p-2 rounded-md">
              <Skeleton className="h-4 bg-neutral-600 rounded w-2/3 mb-2" />
              <Skeleton className="h-3 bg-neutral-600 rounded w-1/2" />
            </div>
          </CardContent>
        </Card>
        <div className="absolute top-2 left-2 p-1 bg-neutral-700 rounded-full shadow-md">
          <Skeleton className="w-4 h-4 bg-neutral-600 rounded-full" />
        </div>
      </div>
    </div>
  )
);

const TVCard: React.FC<{
  tvShow: TVProps;
  index: number;
  style: React.CSSProperties;
  isSelected: boolean;
  onClick: (id: number) => void;
  bookmarks?: string[];
  category: "tv";
}> = ({ tvShow, index, style, isSelected, onClick, bookmarks, category }) => {
  const { addBookmarkMutation, removeBookmarkMutation } =
    useBookmarkMutations();

  // Merge transform into the wrapper style so the FixedSizeList item size remains unchanged
  const rootStyle: React.CSSProperties = {
    ...style,
    transform: isSelected ? "scale(0.8)" : undefined,
    transition: "transform 200ms ease",
    transformOrigin: "center",
  };

  return (
    <div style={rootStyle} className="flex-shrink-0">
      <div className="relative group">
        <Button
          variant="ghost"
          onClick={() => onClick(tvShow.id)}
          className={`w-[140px] h-[210px] overflow-hidden focus:outline-none rounded-md hover:scale-95 transition-transform duration-200 p-0 ${
            isSelected ? "ring-2 ring-blue-500" : ""
          }`}
          style={{ borderRadius: "0.375rem", transformOrigin: "center" }}
        >
          {tvShow.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w342${tvShow.poster_path}`}
              srcSet={`
                https://image.tmdb.org/t/p/w185${tvShow.poster_path} 185w,
                https://image.tmdb.org/t/p/w342${tvShow.poster_path} 342w
              `}
              sizes="(max-width: 640px) 185px, 342px"
              alt={tvShow.name || "TV Show"}
              className="w-full h-full object-cover rounded-md"
              loading="lazy"
              style={{ borderRadius: "0.375rem" }}
            />
          ) : (
            <Card className="w-full h-full bg-neutral-900 flex items-center justify-center rounded-md border-0">
              <CardContent className="p-0 flex items-center justify-center h-full">
                <p className="text-neutral-500 text-sm">No poster</p>
              </CardContent>
            </Card>
          )}
          {/* Styled shadow overlay and animated index/title */}
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
                {tvShow.name || "Unknown"}
              </span>
            </h3>
          </div>
        </Button>
        {auth?.currentUser && (
          <div
            className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 will-change-opacity rounded-full"
            style={{ borderRadius: "30px !important" }}>
            {bookmarks?.includes(tvShow.id.toString()) ? (
              <Button
                variant="ghost"
                size="icon"
                className="p-1 bg-[rgba(255,255,255,0.1)] rounded-full text-red-500 hover:bg-red-500 hover:text-white focus:ring-2 focus:ring-red-500/50 transition-all duration-200 h-8 w-8  mt-2"
                style={{borderRadius : "30px !important"}}
                onClick={() =>
                  removeBookmarkMutation.mutate(tvShow.id.toString())
                }
                disabled={removeBookmarkMutation.isPending}
                aria-label={`Remove ${tvShow.name || "Unknown"} from bookmarks`}>
                <BookmarkMinus size={16} />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="p-1 bg-[rgba(255,255,255,0.1)] rounded-full text-white hover:bg-white hover:text-neutral-900 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 h-8 w-8  mt-2"
                style={{borderRadius : "30px !important"}}
                onClick={() =>
                  addBookmarkMutation.mutate({
                    id: tvShow.id,
                    title: tvShow.name,
                    poster_path: tvShow.poster_path,
                    vote_average: tvShow.vote_average,
                    release_date: tvShow.release_date,
                    category,
                  })
                }
                disabled={addBookmarkMutation.isPending || !tvShow.poster_path}
                aria-label={`Add ${tvShow.name || "Unknown"} to bookmarks`}>
                <BookmarkPlus size={16} />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Skeleton loading component for the main display area
const TvDisplaySkeleton: React.FC = () => {
  const { width: windowWidth } = useWindowSize();
  const visibleItems = Math.max(3, Math.floor(windowWidth / ITEM_SIZE));

  return (
    <div className="relative w-full h-screen flex flex-col bg-neutral-900 text-neutral-100">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(8,8,10,1) 0%, rgba(16,16,18,1) 45%, rgba(26,26,28,1) 100%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent" />
      </div>

      {/* Featured content skeleton */}
      <div className="relative flex-grow flex items-center justify-end z-10">
        <div className="absolute inset-0 flex flex-col items-start justify-end p-4 sm:p-6 lg:p-8 max-w-2xl">
          <Skeleton className="h-10 bg-neutral-800 rounded w-3/4 mb-4" />
          <Skeleton className="h-6 bg-blue-800 rounded w-1/4 mb-2" />
          <Skeleton className="h-4 bg-neutral-800 rounded w-1/2 mb-2" />
          <Skeleton className="h-4 bg-neutral-800 rounded w-1/3 mb-4" />
          <Skeleton className="h-20 bg-neutral-800 rounded w-full mb-4" />
          <div className="flex flex-row gap-3 mt-4">
            <Skeleton className="bg-blue-800 rounded w-32 h-10" />
            <Skeleton className="bg-neutral-800 rounded w-10 h-10" />
          </div>
          <Skeleton className="h-4 bg-neutral-800 rounded w-2/3 mt-2" />
        </div>
      </div>

      {/* Scrollable row skeleton */}
      <div className="w-full h-[230px] py-2 sm:py-4 z-20 flex overflow-hidden relative">
        <div className="absolute left-0 top-0 w-full h-full bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
        <div className="flex gap-4 items-stretch px-4 sm:px-6 w-full">
          {Array.from({ length: visibleItems }).map((_, index) => (
            <TVCardSkeleton
              key={index}
              style={{
                width: `${ITEM_WIDTH}px`,
                height: "210px",
              }}
            />
          ))}
        </div>
      </div>

      {/* Scroll buttons placeholder */}
      <div className="absolute bottom-56 right-4 flex gap-2 z-20">
        <Skeleton className="bg-neutral-800 rounded-md w-10 h-10" />
        <Skeleton className="bg-neutral-800 rounded-md w-10 h-10" />
      </div>
    </div>
  );
};

const TvDisplay: React.FC<DisplayProps> = ({
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
  const hasSetInitialFeatured = useRef(false);
  const [featuredTVId, setFeaturedTVId] = useState<number | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const { width: windowWidth } = useWindowSize();

  const otherTVShows = useMemo(() => data?.results || [], [data?.results]);

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
    data: featuredTVDetails,
    isLoading: isDetailsLoading,
    error: detailsError,
  } = useQuery<DetailedTVProps>({
    queryKey: ["tvDetails", featuredTVId],
    queryFn: () => getTVDetails(featuredTVId?.toString() || ""),
    enabled: !!featuredTVId,
  });

  const featuredTV = useMemo(
    () =>
      otherTVShows.find((tv) => tv.id === featuredTVId) ||
      (data?.results?.length ? data.results[0] : null),
    [otherTVShows, featuredTVId, data?.results]
  );

  // Set default featured TV show to the first in the list
  useEffect(() => {
    if (!hasSetInitialFeatured.current && otherTVShows.length > 0) {
      setFeaturedTVId(otherTVShows[0].id);
      hasSetInitialFeatured.current = true;
    }
  }, [otherTVShows]);

  // Calculate visible items and max scroll offset
  const visibleItems = Math.floor(windowWidth / ITEM_SIZE);
  const maxScrollOffset = Math.max(
    0,
    (otherTVShows.length - visibleItems) * ITEM_SIZE
  );

  // Update scroll button states
  useEffect(() => {
    const updateScrollButtons = () => {
      const currentScroll = scrollOffset;
      setCanScrollLeft(currentScroll > 0);
      setCanScrollRight(currentScroll < maxScrollOffset - 10);
    };

    updateScrollButtons();
  }, [scrollOffset, maxScrollOffset, otherTVShows.length]);

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

  // Scroll functions
  const scrollLeft = useCallback(() => {
    if (listRef.current) {
      const newOffset = Math.max(0, scrollOffset - visibleItems * ITEM_SIZE);
      smoothScrollTo(newOffset, 500);
    }
  }, [scrollOffset, visibleItems, smoothScrollTo]);

  const scrollRight = useCallback(() => {
    if (listRef.current) {
      const newOffset = Math.min(maxScrollOffset, scrollOffset + visibleItems * ITEM_SIZE);
      smoothScrollTo(newOffset, 500);
    }
  }, [scrollOffset, maxScrollOffset, visibleItems, smoothScrollTo]);

  const prefetchTVDetails = useCallback(
    (id: number) => {
      queryClient.prefetchQuery({
        queryKey: ["tvDetails", id],
        queryFn: () => getTVDetails(id.toString()),
      });
    },
    [queryClient]
  );

  const handleTVClick = useMemo(
    () =>
      debounce((id: number) => {
        setFeaturedTVId(id);
        const currentIndex = otherTVShows.findIndex((tv) => tv.id === id);
        if (currentIndex >= 0) {
          [currentIndex - 1, currentIndex + 1]
            .filter((i) => i >= 0 && i < otherTVShows.length)
            .forEach((i) => prefetchTVDetails(otherTVShows[i].id));
          const newOffset = Math.min(currentIndex * ITEM_SIZE, maxScrollOffset);
          smoothScrollTo(newOffset, 500);
        }
      }, 300),
    [otherTVShows, prefetchTVDetails, smoothScrollTo, maxScrollOffset]
  );

  const formatRuntime = useCallback(
    (episodeRunTime?: number[], lastEpisodeRuntime?: number) => {
      if (
        episodeRunTime &&
        episodeRunTime.length > 0 &&
        episodeRunTime[0] > 0
      ) {
        const average = episodeRunTime[0];
        const hours = Math.floor(average / 60);
        const minutes = average % 60;
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      }
      if (lastEpisodeRuntime && lastEpisodeRuntime > 0) {
        const hours = Math.floor(lastEpisodeRuntime / 60);
        const minutes = lastEpisodeRuntime % 60;
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      }
      return "N/A";
    },
    []
  );

  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }).format(new Date(dateString));
    } catch {
      return "N/A";
    }
  }, []);

  const getFeaturedTVIndex = useCallback(
    () => otherTVShows.findIndex((tv) => tv.id === featuredTVId) ?? -1,
    [otherTVShows, featuredTVId]
  );

  // Use combined loading states to show the skeleton
  if (isLoading || !featuredTV) {
    return <TvDisplaySkeleton />;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <section
        className="relative w-full h-screen bg-black text-white overflow-hidden hidden flex-col md:flex"
        style={{
          boxShadow:
            "inset 60px 0 60px -30px rgba(0,0,0,0.8), inset -60px 0 60px -30px rgba(0,0,0,0.8)",
        }}>
        {/* Featured TV Background */}
        <Suspense
          fallback={
            <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
              <Skeleton className="h-full w-full bg-neutral-800" />
            </div>
          }>
          <div className="absolute inset-0 w-full h-full">
            {featuredTV?.backdrop_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w1280${featuredTV.backdrop_path}`}
                srcSet={`
                  https://image.tmdb.org/t/p/w780${featuredTV.backdrop_path} 780w,
                  https://image.tmdb.org/t/p/w1280${featuredTV.backdrop_path} 1280w
                `}
                sizes="(max-width: 1024px) 780px, 1280px"
                alt={featuredTV.name || "Featured TV Show"}
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

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent z-10" />

        {/* Featured TV Content */}
        <div className="relative flex-grow flex items-center justify-end z-20">
          <Suspense
            fallback={
              <div className="absolute inset-0 flex flex-col items-start justify-end p-4 sm:p-6 lg:p-8 text-left max-w-2xl">
                <Skeleton className="h-10 bg-neutral-700 rounded w-3/4 mb-4" />
                <Skeleton className="h-6 bg-red-600 rounded w-1/4 mb-2" />
                <Skeleton className="h-4 bg-neutral-700 rounded w-1/2 mb-2" />
                <Skeleton className="h-4 bg-neutral-700 rounded w-1/3 mb-4" />
                <Skeleton className="h-20 bg-neutral-700 rounded w-full mb-4" />
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
                  <Skeleton className="bg-blue-600 rounded w-32 h-10" />
                  <Skeleton className="bg-neutral-700 rounded w-10 h-10" />
                </div>
                <Skeleton className="h-4 bg-neutral-700 rounded w-2/3 mt-2" />
              </div>
            }>
            {(featuredTV || isDetailsLoading) && (
              <div className="absolute inset-0 flex flex-col items-start justify-end p-4 sm:p-6 lg:p-8 text-left max-w-2xl">
                <h3 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl geist-bold capitalize">
                  {featuredTV?.name || "Unknown"}
                </h3>
                <p className="text-red-500 text-lg sm:text-xl md:text-2xl lg:text-3xl geist-bold capitalize mt-2">
                  {`Rank: ${getFeaturedTVIndex() + 1}`}
                </p>
                <p className="text-neutral-200 text-sm sm:text-base md:text-lg mt-2">
                  {featuredTVDetails?.tagline || "No tagline available"}
                </p>
                <p className="text-neutral-200 text-sm sm:text-base md:text-lg">
                  {formatDate(featuredTVDetails?.first_air_date) ||
                    formatDate(featuredTV?.release_date) ||
                    "N/A"}{" "}
                  •{" "}
                  {formatRuntime(
                    featuredTVDetails?.episode_run_time,
                    featuredTVDetails?.last_episode_to_air?.runtime
                  )}{" "}
                  •{" "}
                  {featuredTVDetails?.original_language?.toUpperCase() || "N/A"}
                </p>
                <p className="text-neutral-300 text-xs sm:text-sm max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mt-2">
                  {featuredTVDetails?.overview ||
                    featuredTV?.overview ||
                    "No overview available"}
                </p>
                {detailsError && (
                  <p className="text-red-500 text-sm mt-2">
                    Failed to load details
                  </p>
                )}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
                  <Link
                    to="/tv/$tvId"
                    params={{ tvId: featuredTV?.id?.toString() || "" }}
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
                    (bookmarks?.includes(featuredTV?.id?.toString() || "") ? (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="p-2 h-10 w-10 rounded-full flex items-center justify-center mt-2"
                        onClick={() =>
                          removeBookmarkMutation.mutate(
                            featuredTV?.id?.toString() || ""
                          )
                        }
                        disabled={removeBookmarkMutation.isPending}
                        aria-label={`Remove ${
                          featuredTV?.name || "Unknown"
                        } from bookmarks`}>
                        <BookmarkMinus size={18} />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="icon"
                        className="p-2 h-10 w-10 rounded-full bg-[#333]/50 backdrop-blur-md text-neutral-100 hover:scale-95 border-0 flex items-center justify-center mt-2"
                        onClick={() =>
                          addBookmarkMutation.mutate({
                            id: featuredTV?.id || 0,
                            title: featuredTV?.name || "",
                            poster_path: featuredTV?.poster_path || "",
                            vote_average: featuredTV?.vote_average || 0,
                            release_date: featuredTV?.release_date || "",
                            category,
                          })
                        }
                        disabled={
                          addBookmarkMutation.isPending ||
                          !featuredTV?.poster_path
                        }
                        aria-label={`Add ${
                          featuredTV?.name || "Unknown"
                        } to bookmarks`}>
                        <BookmarkPlus size={18} />
                      </Button>
                    ))}
                </div>
                <p className="text-neutral-200 text-xs sm:text-sm mt-2">
                  {featuredTVDetails?.genres
                    ?.map((genre) => genre.name)
                    .join(" | ") || "N/A"}
                </p>
              </div>
            )}
          </Suspense>
        </div>

        {/* Scrollable TV List */}
        <div className="w-full h-[230px] bg-gradient-to-t from-black via-black/50 to-transparent py-2 sm:py-4 z-20 relative">
          {isError && (
            <p className="text-red-500 text-sm sm:text-base px-4 sm:px-6">
              Error:{" "}
              {error instanceof Error ? error.message : "An error occurred"}
            </p>
          )}
          
          {/* Scroll Buttons */}
          <div className="absolute right-4 bottom-56 transform -translate-y-1/2 flex gap-2 z-30">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              aria-label="Scroll Left"
              className="bg-[rgba(255,255,255,0.1)] rounded-md p-2 opacity-80 hover:opacity-100 hover:bg-blue-900/20 hover:scale-105 transition-all duration-200 border-0 disabled:opacity-30">
              <ChevronLeft size={20} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollRight}
              disabled={!canScrollRight}
              aria-label="Scroll Right"
              className="bg-[rgba(255,255,255,0.1)] rounded-md p-2 opacity-80 hover:opacity-100 hover:bg-blue-900/20 hover:scale-105 transition-all duration-200 border-0 disabled:opacity-30">
              <ChevronRight size={20} />
            </Button>
          </div>

          {!isError && otherTVShows.length > 0 ? (
            <FixedSizeList
              ref={listRef}
              height={220}
              width={windowWidth}
              itemCount={otherTVShows.length}
              itemSize={ITEM_SIZE}
              layout="horizontal"
              className="px-4 sm:px-6"
              onScroll={({ scrollOffset }) => setScrollOffset(scrollOffset)}
            >
              {({ index, style }: ListChildComponentProps) => (
                <div style={{ ...style, scrollSnapAlign: "start" }}>
                  <TVCard
                    tvShow={otherTVShows[index]}
                    index={index}
                    style={{ width: `${ITEM_WIDTH}px`, height: "210px" }}
                    isSelected={otherTVShows[index].id === featuredTVId}
                    onClick={handleTVClick}
                    bookmarks={bookmarks}
                    category={category}
                  />
                </div>
              )}
            </FixedSizeList>
          ) : (
            <div className="flex overflow-hidden px-4 sm:px-6">
              {Array.from({ length: visibleItems }).map((_, index) => (
                <TVCardSkeleton
                  key={index}
                  style={{
                    width: `${ITEM_WIDTH}px`,
                    height: "210px",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </ErrorBoundary>
  );
};

export default TvDisplay;