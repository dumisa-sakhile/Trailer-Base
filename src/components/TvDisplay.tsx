import { Link } from "@tanstack/react-router";
import React, {
  useRef,
  useState,
  useMemo,
  useCallback,
  useEffect,
  Suspense,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FixedSizeList } from "react-window";
import type { ListChildComponentProps } from "react-window";
import debounce from "lodash/debounce";
import { ErrorBoundary } from "react-error-boundary";
import Loading from "@/components/Loading";
import { auth, db } from "@/config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useBookmarkMutations } from "./useBookmarkMutations";
import { getTVDetails } from "@/api/tv";
import { AddIcon, DeleteIcon, LeftIcon, RightIcon } from "./icons/Icons";

interface TVProps {
  id: number;
  title: string; // Mapped from 'name' in parent component
  release_date: string; // Mapped from 'first_air_date'
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
  name: string; // TMDB's localized title
  original_name?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  first_air_date: string; // TMDB's release date field
}

interface DisplayProps {
  data?: { results: TVProps[] };
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  category?: "tv"; // Defaults to "tv"
}

const ErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div className="text-red-500 text-center p-4">Error: {error.message}</div>
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
  const { addBookmarkMutation, removeBookmarkMutation } = useBookmarkMutations();

  return (
    <div style={style} className="relative group inline-block">
      <Suspense
        fallback={
          <div
            className="w-[180px] h-[270px]  rounded-md"
            style={{ borderRadius: "0.375rem" }}
          >
            <Loading />
          </div>
        }
      >
        <button
          onClick={() => onClick(tvShow.id)}
          className={`w-[180px] h-[270px] overflow-hidden shadow-md focus:outline-none rounded-md ${
            isSelected ? "border-2 border-blue-500" : ""
          }`}
          style={{ borderRadius: "0.375rem" }}
        >
          {tvShow.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w342${tvShow.poster_path}`}
              srcSet={`
                https://image.tmdb.org/t/p/w185${tvShow.poster_path} 185w,
                https://image.tmdb.org/t/p/w342${tvShow.poster_path} 342w
              `}
              sizes="(max-width: 640px) 185px, 342px"
              alt={tvShow.title || "TV Show"}
              className="w-full h-full object-cover rounded-md"
              loading="lazy"
              style={{ borderRadius: "0.375rem" }}
            />
          ) : (
            <div
              className="w-full h-full  flex items-center justify-center rounded-md"
              style={{ borderRadius: "0.375rem" }}
            >
              <p className="text-gray-500 text-sm">No poster</p>
            </div>
          )}
          <div
            className="absolute inset-0 bg-black/50 flex flex-col justify-end p-2 rounded-md"
            style={{ borderRadius: "0.375rem" }}
          >
            <h3 className="text-white text-sm  text-left line-clamp-1 font-bold">
              <span className="font-bold text-3xl">{index + 1}</span> - {tvShow.title}
            </h3>
            <p className="text-gray-300 text-xs text-left">
              {tvShow.release_date
                ? new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  }).format(new Date(tvShow.release_date))
                : ""}
            </p>
            <p className="text-yellow-400 text-xs text-left">
              ★ {tvShow.vote_average.toFixed(1)}/10
            </p>
          </div>
        </button>
        {auth?.currentUser && (
          <div className="absolute top-1 left-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 will-change-opacity">
            {bookmarks?.includes(tvShow.id.toString()) ? (
              <button
                className="p-1 bg-[rgba(255,255,255,0.1)] rounded-full text-red-500 hover:bg-red-500 hover:text-white focus:ring-2 focus:ring-red-500/50 transition-all duration-200"
                onClick={() => removeBookmarkMutation.mutate(tvShow.id.toString())}
                disabled={removeBookmarkMutation.isPending}
                aria-label={`Remove ${tvShow.title || "Unknown Title"} from bookmarks`}
              >
                <DeleteIcon />
              </button>
            ) : (
              <button
                className="p-1 bg-[rgba(255,255,255,0.1)] rounded-full text-white hover:bg-white hover:text-gray-900 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                onClick={() =>
                  addBookmarkMutation.mutate({
                    id: tvShow.id,
                    title: tvShow.title,
                    poster_path: tvShow.poster_path,
                    vote_average: tvShow.vote_average,
                    release_date: tvShow.release_date,
                    category,
                  })
                }
                disabled={addBookmarkMutation.isPending || !tvShow.poster_path}
                aria-label={`Add ${tvShow.title || "Unknown Title"} to bookmarks`}
              >
                <AddIcon />
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
  category = "tv",
}) => {
  const listRef = useRef<FixedSizeList>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [featuredTvId, setFeaturedTvId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { addBookmarkMutation, removeBookmarkMutation } = useBookmarkMutations();

  const otherTVShows = useMemo(() => data?.results || [], [data?.results]);

  useEffect(() => {
    if (otherTVShows.length > 0 && featuredTvId === null) {
      const newId = otherTVShows[0].id;
      if (Number.isInteger(newId) && newId > 0) {
        setFeaturedTvId(newId);
      }
    }
  }, [otherTVShows, featuredTvId]);

  const { data: bookmarks } = useQuery<string[]>({
    queryKey: ["bookmarks", auth.currentUser?.uid],
    queryFn: async () => {
      if (!auth.currentUser) return [];
      const bookmarksRef = collection(db, "users", auth.currentUser.uid, "bookmarks");
      const snapshot = await getDocs(bookmarksRef);
      return snapshot.docs.map((doc) => doc.id);
    },
    enabled: !!auth.currentUser,
  });

  const {
    data: featuredTvDetails,
    isLoading: isDetailsLoading,
    error: detailsError,
  } = useQuery<DetailedTVProps>({
    queryKey: ["tvDetails", featuredTvId],
    queryFn: async () => {
      if (!featuredTvId) throw new Error("Invalid TV show ID");
      return await getTVDetails(featuredTvId.toString());
    },
    enabled: !!featuredTvId && Number.isInteger(featuredTvId) && featuredTvId > 0,
    retry: 1,
  });

  const featuredTvShow = useMemo(
    () =>
      otherTVShows.find((tv) => tv.id === featuredTvId) ||
      (otherTVShows.length ? otherTVShows[0] : null),
    [otherTVShows, featuredTvId]
  );

  useEffect(() => {
    if (!isLoading && !isDetailsLoading && (featuredTvShow || featuredTvDetails)) {
      setIsInitialLoading(false);
    }
  }, [isLoading, isDetailsLoading, featuredTvShow, featuredTvDetails]);

  const smoothScrollTo = useCallback(
    (targetOffset: number, duration: number) => {
      const startOffset = scrollOffset;
      const startTime = performance.now();

      const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = progress * (2 - progress);
        const newOffset = startOffset + (targetOffset - startOffset) * ease;

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

  const scrollLeft = useCallback(() => {
    if (listRef.current) {
      const visibleItems = Math.floor(window.innerWidth / 190);
      const maxOffset = Math.max(0, (otherTVShows.length - visibleItems) * 190);
      if (scrollOffset === 0) {
        // At start, scroll to end
        smoothScrollTo(maxOffset, 500);
      } else {
        const currentIndex = Math.round(scrollOffset / 190);
        const newIndex = Math.max(currentIndex - 1, 0);
        const newOffset = newIndex * 190;
        smoothScrollTo(newOffset, 500);
      }
    }
  }, [scrollOffset, otherTVShows.length, smoothScrollTo]);

  const scrollRight = useCallback(() => {
    if (listRef.current) {
      const visibleItems = Math.floor(window.innerWidth / 190);
      const maxOffset = Math.max(0, (otherTVShows.length - visibleItems) * 190);
      if (scrollOffset >= maxOffset) {
        // At end, scroll to start
        smoothScrollTo(0, 500);
      } else {
        const currentIndex = Math.round(scrollOffset / 190);
        const newIndex = Math.min(currentIndex + 1, otherTVShows.length - 1);
        const newOffset = newIndex * 190;
        smoothScrollTo(newOffset, 500);
      }
    }
  }, [scrollOffset, otherTVShows.length, smoothScrollTo]);

  const prefetchTvDetails = useCallback(
    (id: number) => {
      if (!Number.isInteger(id) || id <= 0) return;
      queryClient.prefetchQuery({
        queryKey: ["tvDetails", id],
        queryFn: () => getTVDetails(id.toString()),
      });
    },
    [queryClient]
  );

  const handleTvClick = useMemo(
    () =>
      debounce((id: number) => {
        if (!Number.isInteger(id) || id <= 0) return;
        setFeaturedTvId(id);
        const currentIndex = otherTVShows.findIndex((tv) => tv.id === id);
        if (currentIndex >= 0) {
          [currentIndex - 1, currentIndex + 1]
            .filter((i) => i >= 0 && i < otherTVShows.length)
            .forEach((i) => prefetchTvDetails(otherTVShows[i].id));
          const visibleItems = Math.floor(window.innerWidth / 190);
          const maxOffset = Math.max(0, (otherTVShows.length - visibleItems) * 190);
          const newOffset = Math.min(currentIndex * 190, maxOffset);
          smoothScrollTo(newOffset, 500);
        }
      }, 300),
    [otherTVShows, prefetchTvDetails, smoothScrollTo]
  );

  const formatRuntime = useCallback((runtime?: number[]) => {
    if (!runtime || runtime.length === 0 || runtime[0] <= 0) return "";
    return `${runtime[0]}m`;
  }, []);

  const formatDate = useCallback((date?: string) => {
    if (!date) return "";
    try {
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(date));
    } catch {
      return "";
    }
  }, []);

  const formatLanguage = useCallback((lang?: string) => {
    if (!lang) return "";
    return new Intl.DisplayNames(["en"], { type: "language" }).of(lang)?.toUpperCase() || "";
  }, []);

  const getFeaturedTvIndex = useCallback(
    () => otherTVShows.findIndex((tv) => tv.id === featuredTvId) ?? -1,
    [otherTVShows, featuredTvId]
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
      <section className="relative w-full h-screen bg-black text-white overflow-hidden hidden flex-col md:flex">
        {/* Featured TV Show Background */}
        <Suspense
          fallback={
            <div className="absolute inset-0  flex items-center justify-center">
              <Loading />
            </div>
          }
        >
          <div className="absolute inset-0 w-full h-full">
            {featuredTvShow?.backdrop_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w1280${featuredTvShow.backdrop_path}`}
                srcSet={`
                  https://image.tmdb.org/t/p/w780${featuredTvShow.backdrop_path} 780w,
                  https://image.tmdb.org/t/p/w1280${featuredTvShow.backdrop_path} 1280w
                `}
                sizes="(max-width: 1024px) 780px, 1280px"
                alt={featuredTvShow.title || "Featured TV Show"}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full  flex items-center justify-center">
                <p className="text-gray-400">No backdrop available</p>
              </div>
            )}
          </div>
        </Suspense>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />

        {/* Featured TV Show Content */}
        <Suspense
          fallback={
            <div className="relative flex-grow flex items-center justify-center z-20">
              <Loading />
            </div>
          }
        >
          <div className="relative flex-grow flex items-center justify-start z-20">
            {(featuredTvShow || isDetailsLoading) && (
              <div className="absolute inset-0 flex flex-col items-start justify-end p-4 sm:p-6 lg:p-8 text-left max-w-2xl">
                <h3 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold capitalize hidden lg:block">
                  {featuredTvDetails?.name || featuredTvShow?.title || "Unknown"}
                </h3>
                <p className="text-red-500 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold capitalize mt-2">
                  {`Rank: ${getFeaturedTvIndex() + 1}`}
                </p>
                {featuredTvDetails?.tagline && (
                  <p className="text-gray-200 text-sm sm:text-base md:text-lg mt-2">
                    {featuredTvDetails.tagline}
                  </p>
                )}
                <p className="text-gray-200 text-sm sm:text-base md:text-lg">
                  {[
                    formatDate(featuredTvDetails?.first_air_date || featuredTvShow?.release_date),
                    formatRuntime(featuredTvDetails?.episode_run_time),
                    formatLanguage(featuredTvDetails?.original_language),
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
                <p className="text-gray-300 text-sm sm:text-base max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mt-2">
                  {featuredTvDetails?.overview || featuredTvShow?.overview || "No overview available"}
                </p>
                {detailsError && (
                  <p className="text-red-500 text-sm mt-2">
                    Failed to load details: {detailsError instanceof Error ? detailsError.message : "Unknown error"}
                  </p>
                )}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
                  <Link
                    to="/tv/$tvId"
                    params={{ tvId: featuredTvShow?.id?.toString() || "" }}
                    className="bg-blue-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded hover:bg-blue-700 text-base sm:text-xl flex items-center justify-center focus:ring-2 focus:ring-blue-500"
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 inline-block mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.68L9.54 5.98C8.87 5.55 8 6.03 8 6.82z" />
                    </svg>
                    Watch Now
                  </Link>
                  {auth?.currentUser &&
                    (bookmarks?.includes(featuredTvShow?.id?.toString() || "") ? (
                      <button
                        className="bg-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition-transform duration-200"
                        onClick={() => removeBookmarkMutation.mutate(featuredTvShow?.id?.toString() || "")}
                        disabled={removeBookmarkMutation.isPending}
                        aria-label={`Remove ${featuredTvShow?.title || "Unknown Title"} from bookmarks`}
                      >
                        <DeleteIcon />
                      </button>
                    ) : (
                      <button
                        className="bg-slate-600/50 backdrop-blur-md text-gray-100 w-12 h-12 rounded-full flex items-center justify-center hover:bg-slate-700/70 focus:ring-2 focus:ring-slate-500 transition-transform duration-200"
                        onClick={() =>
                          addBookmarkMutation.mutate({
                            id: featuredTvShow?.id || 0,
                            title: featuredTvShow?.title || "",
                            poster_path: featuredTvShow?.poster_path || "",
                            vote_average: featuredTvShow?.vote_average || 0,
                            release_date: featuredTvShow?.release_date || "",
                            category,
                          })
                        }
                        disabled={addBookmarkMutation.isPending || !featuredTvShow?.poster_path}
                        aria-label={`Add ${featuredTvShow?.title || "Unknown Title"} to bookmarks`}
                      >
                        <AddIcon />
                      </button>
                    ))}
                </div>
                {featuredTvDetails?.genres?.length && (
                  <p className="text-gray-200 text-xs sm:text-sm mt-2">
                    {featuredTvDetails.genres.map((genre) => genre.name).join(" | ")}
                  </p>
                )}
              </div>
            )}
          </div>
        </Suspense>

        {/* Scrollable TV Show List */}
        <div className="w-full h-[290px] bg-gradient-to-t from-black via-black/50 to-transparent py-2 sm:py-4 z-20">
          {isError && (
            <p className="text-red-500 text-sm sm:text-base px-4 sm:px-6">
              Error: {error instanceof Error ? error.message : "An error occurred"}
            </p>
          )}
          {!isError && otherTVShows.length > 0 && (
            <FixedSizeList
              ref={listRef}
              height={291}
              width={window.innerWidth}
              itemCount={otherTVShows.length}
              itemSize={190}
              layout="horizontal"
              className="px-4 sm:px-6"
            >
              {({ index, style }: ListChildComponentProps) => (
                <div style={{ ...style, scrollSnapAlign: "start" }}>
                  <TVCard
                    tvShow={otherTVShows[index]}
                    index={index}
                    style={{ width: "180px", height: "270px" }}
                    isSelected={otherTVShows[index].id === featuredTvId}
                      onClick={handleTvClick}
                    bookmarks={bookmarks}
                    category={category}
                  />
                </div>
              )}
            </FixedSizeList>
          )}
        </div>
      )

        {/* Scroll Buttons */}
        <div className="absolute bottom-78 right-2 flex gap-2 z-20">
          <button
            onClick={scrollLeft}
            aria-label="Scroll Left"
            className="bg-[rgba(255,255,255,0.1)] rounded-md p-2 sm:p-3.5 opacity-30 hover:opacity-80 hover:bg-blue-900/20 hover:scale-105 transition-all duration-200 will-change-transform ring-1 ring-blue-400/10 focus:ring-2 focus:ring-blue-500/50"
          >
            <LeftIcon />
          </button>
          <button
            onClick={scrollRight}
            aria-label="Scroll Right"
            className="bg-[rgba(255,255,255,0.1)] rounded-md p-2 sm:p-3.5 opacity-30 hover:opacity-80 hover:bg-blue-900/20 hover:scale-105 transition-all duration-200 will-change-transform ring-1 ring-blue-400/10 focus:ring-2 focus:ring-blue-500/50"
          >
            <RightIcon />
          </button>
        </div>
      </section>
    </ErrorBoundary>
  );
};

export default TvDisplay;