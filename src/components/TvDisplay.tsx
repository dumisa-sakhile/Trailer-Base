import { Link } from "@tanstack/react-router";
import React, {
  useState,
  useMemo,
  useCallback,
  Suspense,
  useEffect,
  useRef,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import debounce from "lodash/debounce";
import { ErrorBoundary } from "react-error-boundary";
import { auth, db } from "@/config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useBookmarkMutations } from "./useBookmarkMutations";
import { getTVDetails } from "@/api/tv";
import { AddIcon, DeleteIcon } from "./icons/Icons"; // Removed LeftIcon, RightIcon
import Atropos from "atropos/react";
import "atropos/atropos.css";
import { motion, useAnimationControls } from "framer-motion";

interface TVProps {
  id: number;
  title: string;
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
}

interface DisplayProps {
  data?: { results: TVProps[] };
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  category?: "tv";
}

const ErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div className="text-red-500 text-center p-4">Error: {error.message}</div>
);

const CustomLoading: React.FC = () => (
  <div className="flex items-center justify-center h-24">
    <div className="w-12 h-12 border-4 border-t-blue-600 border-gray-700 rounded-full animate-spin-pulse"></div>
    <style>{`
      @keyframes spin-pulse {
        0% {
          transform: rotate(0deg);
          border-width: 4px;
        }
        50% {
          border-width: 6px;
        }
        100% {
          transform: rotate(360deg);
          border-width: 4px;
        }
      }
      .animate-spin-pulse {
        animation: spin-pulse 1s linear infinite;
      }
    `}</style>
  </div>
);

const TvDisplay: React.FC<DisplayProps> = ({
  data,
  isLoading,
  isError,
  error,
  category = "tv",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const queryClient = useQueryClient();
  const { addBookmarkMutation, removeBookmarkMutation } = useBookmarkMutations();
  const carouselRef = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();

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

  const { data: centerTVDetails, isLoading: isDetailsLoading } =
    useQuery<DetailedTVProps>({
      queryKey: ["tvDetails", otherTVShows[currentIndex]?.id],
      queryFn: () =>
        getTVDetails(otherTVShows[currentIndex]?.id?.toString() || ""),
      enabled:
        !!otherTVShows[currentIndex]?.id &&
        Number.isInteger(otherTVShows[currentIndex]?.id) &&
        otherTVShows[currentIndex]?.id > 0,
      retry: 1,
    });

  useEffect(() => {
    if (!isLoading && otherTVShows.length > 0) {
      setIsInitialLoading(false);
    }
  }, [isLoading, otherTVShows]);

  const handleCardClick = async (index: number) => {
    if (index !== currentIndex) {
      setCurrentIndex(index);
      await controls.start({ x: 0 });
    }
  };

  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
    const cardWidth = 200;
    const threshold = cardWidth / 2;
    if (Math.abs(info.offset.x) > threshold) {
      const direction = info.offset.x > 0 ? -1 : 1;
      setCurrentIndex(
        (prev) => (prev - direction + otherTVShows.length) % otherTVShows.length
      );
    }
    controls.start({ x: 0 });
  };

  const prefetchTVDetails = useCallback(
    (id: number) => {
      if (!Number.isInteger(id) || id <= 0) return;
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
        if (!Number.isInteger(id) || id <= 0) return;
        const currentIndex = otherTVShows.findIndex((tv) => tv.id === id);
        if (currentIndex >= 0) {
          [currentIndex - 1, currentIndex + 1]
            .filter((i) => i >= 0 && i < otherTVShows.length)
            .forEach((i) => prefetchTVDetails(otherTVShows[i].id));
        }
      }, 300),
    [otherTVShows, prefetchTVDetails]
  );

  const formatRuntime = useCallback((runtime?: number[]) => {
    if (!runtime || runtime.length === 0 || runtime[0] <= 0) return "";
    return `${runtime[0]}m`;
  }, []);

  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return "";
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(dateString));
    } catch {
      return "";
    }
  }, []);

  const formatLanguage = useCallback((lang?: string) => {
    if (!lang) return "";
    return (
      new Intl.DisplayNames(["en"], { type: "language" })
        .of(lang)
        ?.toUpperCase() || ""
    );
  }, []);

  if (isInitialLoading) {
    return (
      <div className="relative w-full h-screen  flex items-center justify-center">
        <CustomLoading />
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <section className="relative w-full h-screen  text-white overflow-hidden flex flex-col items-center justify-center  px-4 sm:px-6 lg:px-8">
        <div className="-mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold ">Trending TV Shows</h2>
          <p>Select a TV show to get started</p>
        </div>
        <Suspense
          fallback={
            <div className="relative flex-grow flex items-center justify-center">
              <CustomLoading />
            </div>
          }>
          <div className="relative w-full max-w-[1400px] h-[700px] flex items-end justify-center">
            {isError && (
              <p className="text-red-500 text-sm sm:text-base">
                Error:{" "}
                {error instanceof Error ? error.message : "An error occurred"}
              </p>
            )}
            {!isError && otherTVShows.length > 0 && (
              <div className="relative w-full h-full flex items-end justify-center perspective-1000">
                <motion.div
                  ref={carouselRef}
                  className="relative w-full h-full flex items-end justify-center overflow-hidden"
                  style={{ cursor: "grab" }}>
                  {otherTVShows.map((tvShow, index) => {
                    const totalTVShows = otherTVShows.length;
                    let offset = index - currentIndex;
                    if (offset > totalTVShows / 2) offset -= totalTVShows;
                    if (offset < -totalTVShows / 2) offset += totalTVShows;
                    const absOffset = Math.abs(offset);
                    const isActive = offset === 0;

                    const x = offset * 200;
                    const scale = 1 - absOffset * 0.05;
                    const zIndex = 100 - absOffset * 30;
                    const opacity = 1;

                    return (
                      <motion.div
                        key={tvShow.id}
                        className="absolute group"
                        animate={{ x, scale, opacity, zIndex }}
                        transition={{
                          type: "spring",
                          stiffness: 100,
                          damping: 20,
                        }}
                        drag={isActive ? false : "x"}
                        dragConstraints={{ left: -1000, right: 1000 }}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleCardClick(index)}
                        style={{ zIndex }}>
                        <Atropos
                          className="w-[400px] h-[600px] rounded-lg" // Updated size
                          activeOffset={0}
                          shadow={false}
                          shadowScale={1}
                          rotateXMax={12}
                          rotateYMax={12}>
                          <div className="atropos-scale">
                            <div className="atropos-rotate">
                              <div className="atropos-inner bg-[#1a1a1a]/80 rounded-lg border border-gray-700/50">
                                {isActive ? (
                                  <div
                                    className="relative w-full h-full rounded-lg bg-cover bg-center"
                                    style={{
                                      backgroundImage: tvShow.poster_path
                                        ? `url(https://image.tmdb.org/t/p/w500${tvShow.poster_path})`
                                        : "none",
                                    }}>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent flex flex-col justify-end p-6 rounded-lg">
                                      <Suspense fallback={<CustomLoading />}>
                                        {isDetailsLoading &&
                                        !centerTVDetails ? (
                                          <CustomLoading />
                                        ) : (
                                          <>
                                            <h3 className="text-white text-xl sm:text-2xl font-bold capitalize">
                                              {centerTVDetails?.original_name ||
                                                centerTVDetails?.title ||
                                                tvShow.title ||
                                                "Unknown"}
                                            </h3>
                                            <p className="text-red-500 text-base sm:text-lg font-bold capitalize mt-1">
                                              Rank: {index + 1}
                                            </p>
                                            {centerTVDetails?.tagline && (
                                              <p className="text-gray-200 text-sm mt-1">
                                                {centerTVDetails.tagline}
                                              </p>
                                            )}
                                            <p className="text-gray-200 text-sm mt-1">
                                              {[
                                                formatDate(
                                                  centerTVDetails?.release_date ||
                                                    tvShow.release_date
                                                ),
                                                formatRuntime(
                                                  centerTVDetails?.episode_run_time
                                                ),
                                                formatLanguage(
                                                  centerTVDetails?.original_language
                                                ),
                                              ]
                                                .filter(Boolean)
                                                .join(" • ")}
                                            </p>
                                            <p className="text-gray-300 text-sm max-w-[90%] mt-2 line-clamp-3">
                                              {centerTVDetails?.overview ||
                                                tvShow.overview ||
                                                "No overview available"}
                                            </p>
                                            {centerTVDetails?.genres?.length && (
                                              <p className="text-gray-200 text-xs mt-2">
                                                {centerTVDetails.genres
                                                  .map((genre) => genre.name)
                                                  .join(" | ")}
                                              </p>
                                            )}
                                            <div className="flex gap-3 mt-4">
                                              <Link
                                                to="/tv/$tvId"
                                                params={{
                                                  tvId: tvShow.id.toString(),
                                                }}
                                                className="bg-blue-600 text-white px-8 py-2 rounded hover:bg-blue-700 text-sm flex items-center focus:ring-2 focus:ring-blue-500"
                                                onClick={() =>
                                                  handleTVClick(tvShow.id)
                                                }>
                                                <svg
                                                  className="w-4 h-4 inline-block mr-1"
                                                  fill="currentColor"
                                                  viewBox="0 0 24 24">
                                                  <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.68L9.54 5.98C8.87 5.55 8 6.03 8 6.82z" />
                                                </svg>
                                                Watch Now
                                              </Link>
                                              {auth?.currentUser &&
                                                (bookmarks?.includes(
                                                  tvShow.id.toString()
                                                ) ? (
                                                  <button
                                                    className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition-transform duration-200"
                                                    onClick={() =>
                                                      removeBookmarkMutation.mutate(
                                                        tvShow.id.toString()
                                                      )
                                                    }
                                                    disabled={
                                                      removeBookmarkMutation.isPending
                                                    }
                                                    aria-label={`Remove ${tvShow.title || "Unknown Title"} from bookmarks`}>
                                                    <DeleteIcon />
                                                  </button>
                                                ) : (
                                                  <button
                                                    className="bg-slate-600/50 backdrop-blur-md text-gray-100 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-700/70 focus:ring-2 focus:ring-slate-500 transition-transform duration-200"
                                                    onClick={() =>
                                                      addBookmarkMutation.mutate(
                                                        {
                                                          id: tvShow.id,
                                                          title: tvShow.title,
                                                          poster_path:
                                                            tvShow.poster_path,
                                                          vote_average:
                                                            tvShow.vote_average,
                                                          release_date:
                                                            tvShow.release_date,
                                                          category,
                                                        }
                                                      )
                                                    }
                                                    disabled={
                                                      addBookmarkMutation.isPending ||
                                                      !tvShow.poster_path
                                                    }
                                                    aria-label={`Add ${tvShow.title || "Unknown Title"} to bookmarks`}>
                                                    <AddIcon />
                                                  </button>
                                                ))}
                                            </div>
                                          </>
                                        )}
                                      </Suspense>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="w-full h-full rounded-lg">
                                    {tvShow.poster_path ? (
                                      <img
                                        src={`https://image.tmdb.org/t/p/w500${tvShow.poster_path}`}
                                        srcSet={`
                                          https://image.tmdb.org/t/p/w342${tvShow.poster_path} 342w,
                                          https://image.tmdb.org/t/p/w500${tvShow.poster_path} 500w
                                        `}
                                        sizes="(max-width: 640px) 342px, 500px"
                                        alt={tvShow.title || "TV Show"}
                                        className="w-full h-full object-cover rounded-lg"
                                        loading="lazy"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center rounded-lg bg-[#1a1a1a]/80">
                                        <p className="text-gray-400 text-lg">
                                          No poster
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </Atropos>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            )}
          </div>
        </Suspense>
      </section>
    </ErrorBoundary>
  );
};

export default TvDisplay;