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
import { useBookmarkMutations } from "./useBookmarkMutations";
import { getTVDetails } from "@/api/tv";
import Loading from "@/components/Loading";

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

  return (
    <div style={style} className="relative group inline-block">
      <Suspense
        fallback={
          <div
            className="w-[140px] h-[210px] bg-gray-900 rounded-md"
            style={{ borderRadius: "0.375rem" }}>
            <Loading />
          </div>
        }>
        <button
          onClick={() => onClick(tvShow.id)}
          className={`w-[140px] h-[210px] overflow-hidden shadow-md focus:outline-none rounded-md ${
            isSelected ? "border-2 border-blue-500" : ""
          }`}
          style={{ borderRadius: "0.375rem" }}>
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
            <div
              className="w-full h-full bg-gray-900 flex items-center justify-center rounded-md"
              style={{ borderRadius: "0.375rem" }}>
              <p className="text-gray-500 text-sm">No poster</p>
            </div>
          )}
          <div
            className="absolute inset-0 bg-black/50 flex flex-col justify-end p-2 rounded-md"
            style={{ borderRadius: "0.375rem" }}>
            <h3 className="text-white text-xs font-semibold text-left line-clamp-2 geist-bold">
              <span className="font-bold text-lg">{index + 1}</span> -{" "}
              {tvShow.name || "Unknown"}
            </h3>
          </div>
        </button>
        {auth?.currentUser && (
          <div
            className="absolute top-1 left-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 will-change-opacity rounded-md"
            style={{ borderRadius: "0.375rem" }}>
            {bookmarks?.includes(tvShow.id.toString()) ? (
              <button
                className="p-1 bg-[rgba(255,255,255,0.1)] rounded-full text-red-500 hover:bg-red-500 hover:text-white focus:ring-2 focus:ring-red-500/50 transition-all duration-200"
                onClick={() =>
                  removeBookmarkMutation.mutate(tvShow.id.toString())
                }
                disabled={removeBookmarkMutation.isPending}
                aria-label={`Remove ${tvShow.name || "Unknown"} from bookmarks`}>
                <BookmarkMinus size={20} />
              </button>
            ) : (
              <button
                className="p-1 bg-[rgba(255,255,255,0.1)] rounded-full text-white hover:bg-white hover:text-gray-900 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
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
                <BookmarkPlus size={20} />
              </button>
            )}
          </div>
        )}
      </Suspense>
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
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const queryClient = useQueryClient();
  const { addBookmarkMutation, removeBookmarkMutation } =
    useBookmarkMutations();
  const [featuredTVId, setFeaturedTVId] = useState<number | null>(null);
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

  // Handle initial loading state
  useEffect(() => {
    if (!isLoading && !isDetailsLoading && (featuredTV || featuredTVDetails)) {
      setIsInitialLoading(false);
    }
  }, [isLoading, isDetailsLoading, featuredTV, featuredTVDetails]);

  // Set default featured TV show to the first in the list
  useEffect(() => {
    if (!featuredTVId && otherTVShows.length > 0) {
      setFeaturedTVId(otherTVShows[0].id);
    }
  }, [featuredTVId, otherTVShows]);

  // Calculate visible items and max scroll offset
  const visibleItems = Math.floor(windowWidth / ITEM_SIZE);
  const maxScrollOffset = Math.max(
    0,
    (otherTVShows.length - visibleItems) * ITEM_SIZE
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

  // Debounced scroll functions
  const scrollLeft = useMemo(
    () =>
      debounce(
        () => {
          if (listRef.current) {
            const currentIndex = Math.floor(scrollOffset / ITEM_SIZE);
            if (currentIndex <= 0) {
              const newOffset = Math.max(
                0,
                (otherTVShows.length - visibleItems) * ITEM_SIZE
              );
              smoothScrollTo(newOffset, 500);
            } else {
              const newIndex = currentIndex - 1;
              const newOffset = newIndex * ITEM_SIZE;
              smoothScrollTo(newOffset, 500);
            }
          }
        },
        300,
        { leading: true, trailing: false }
      ),
    [scrollOffset, otherTVShows.length, visibleItems, smoothScrollTo]
  );

  const scrollRight = useMemo(
    () =>
      debounce(
        () => {
          if (listRef.current) {
            const currentIndex = Math.floor(scrollOffset / ITEM_SIZE);
            const maxIndex = otherTVShows.length - 1;
            if (currentIndex >= maxIndex - visibleItems + 1) {
              smoothScrollTo(0, 500);
            } else {
              const newIndex = currentIndex + 1;
              const newOffset = newIndex * ITEM_SIZE;
              smoothScrollTo(newOffset, 500);
            }
          }
        },
        300,
        { leading: true, trailing: false }
      ),
    [scrollOffset, otherTVShows.length, visibleItems, smoothScrollTo]
  );

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

  if (isInitialLoading) {
    return (
      <div className="relative w-full h-screen bg-black flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <section
        className="relative -mt-10 w-full h-screen bg-black text-white overflow-hidden hidden flex-col md:flex"
        style={{
          boxShadow:
            "inset 60px 0 60px -30px rgba(0,0,0,0.8), inset -60px 0 60px -30px rgba(0,0,0,0.8)",
        }}>
        {/* Featured TV Background */}
        <Suspense
          fallback={
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              <Loading />
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
              <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                <p className="text-gray-400">No backdrop available</p>
              </div>
            )}
          </div>
        </Suspense>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />

        {/* Featured TV Content */}
        <Suspense
          fallback={
            <div className="relative flex-grow flex items-center justify-center z-20">
              <Loading />
            </div>
          }>
          <div className="relative flex-grow flex items-center justify-end z-20">
            {(featuredTV || isDetailsLoading) && (
              <div className="absolute inset-0 flex flex-col items-start justify-end p-4 sm:p-6 lg:p-8 text-left max-w-2xl">
                <h3 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl geist-bold capitalize">
                  {featuredTV?.name || "Unknown"}
                </h3>
                <p className="text-red-500 text-lg sm:text-xl md:text-2xl lg:text-3xl geist-bold capitalize mt-2">
                  {`Rank: ${getFeaturedTVIndex() + 1}`}
                </p>
                <p className="text-gray-200 text-sm sm:text-base md:text-lg mt-2">
                  {featuredTVDetails?.tagline || "No tagline available"}
                </p>
                <p className="text-gray-200 text-sm sm:text-base md:text-lg">
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
                <p className="text-gray-300 text-xs sm:text-sm max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mt-2">
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
                      <button
                        className="bg-red-600 text-white px-4 sm:px-4 py-2 sm:py-3 rounded hover:bg-red-700 text-base sm:text-xl flex items-center justify-center focus:ring-2 focus:ring-red-500"
                        onClick={() =>
                          removeBookmarkMutation.mutate(
                            featuredTV?.id?.toString() || ""
                          )
                        }
                        disabled={removeBookmarkMutation.isPending}
                        aria-label={`Remove ${featuredTV?.name || "Unknown"} from bookmarks`}>
                        <BookmarkMinus size={20} />
                      </button>
                    ) : (
                      <button
                        className="bg-[#333]/50 backdrop-blur-md text-gray-100 px-4 sm:px-5 py-2 sm:py-3 rounded hover:scale-95 text-base sm:text-xl flex items-center justify-center"
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
                        aria-label={`Add ${featuredTV?.name || "Unknown"} to bookmarks`}>
                        <BookmarkPlus size={20} />
                      </button>
                    ))}
                </div>
                <p className="text-gray-200 text-xs sm:text-sm mt-2">
                  {featuredTVDetails?.genres
                    ?.map((genre) => genre.name)
                    .join(" | ") || "N/A"}
                </p>
              </div>
            )}
          </div>
        </Suspense>

        {/* Scrollable TV List */}
        <div className="w-full h-[230px] bg-gradient-to-t from-black via-black/50 to-transparent py-2 sm:py-4 z-20">
          {isError && (
            <p className="text-red-500 text-sm sm:text-base px-4 sm:px-6">
              Error:{" "}
              {error instanceof Error ? error.message : "An error occurred"}
            </p>
          )}
          {!isError && otherTVShows.length > 0 && (
            <FixedSizeList
              ref={listRef}
              height={220}
              width={windowWidth}
              itemCount={otherTVShows.length}
              itemSize={ITEM_SIZE}
              layout="horizontal"
              className="px-4 sm:px-6">
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

export default TvDisplay;
