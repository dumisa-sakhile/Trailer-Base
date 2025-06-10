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
import Loading from "@/components/Loading";
import { auth, db } from "@/config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useBookmarkMutations } from "./useBookmarkMutations";
import { getMovieDetails } from "@/api/movie";
import { AddIcon, DeleteIcon, LeftIcon, RightIcon } from "./icons/Icons";

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

const MovieCard: React.FC<{
  movie: MovieProps;
  index: number;
  style: React.CSSProperties;
  isSelected: boolean;
  onClick: (id: number) => void;
  bookmarks?: string[];
  category: "movie" | "tv";
}> = ({ movie, index, style, isSelected, onClick, bookmarks, category }) => {
  const { addBookmarkMutation, removeBookmarkMutation } =
    useBookmarkMutations();

  return (
    <div style={style} className="relative group inline-block">
      <Suspense
        fallback={
          <div
            className="w-[180px] h-[101px] bg-gray-900 rounded-md"
            style={{ borderRadius: "0.375rem" }}>
            <Loading />
          </div>
        }>
        <button
          onClick={() => onClick(movie.id)}
          className={`w-[180px] h-[101px] overflow-hidden shadow-md focus:outline-none rounded-md ${
            isSelected ? "border-2 border-blue-500" : ""
          }`}
          style={{ borderRadius: "0.375rem" }}>
          {movie.backdrop_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.backdrop_path}`}
              srcSet={`
                https://image.tmdb.org/t/p/w342${movie.backdrop_path} 342w,
                https://image.tmdb.org/t/p/w500${movie.backdrop_path} 500w
              `}
              sizes="(max-width: 640px) 342px, 500px"
              alt={movie.title || "Movie"}
              className="w-full h-full object-cover rounded-md"
              loading="lazy"
              style={{ borderRadius: "0.375rem" }}
            />
          ) : (
            <div
              className="w-full h-full bg-gray-900 flex items-center justify-center rounded-md"
              style={{ borderRadius: "0.375rem" }}>
              <p className="text-gray-500 text-sm">No backdrop</p>
            </div>
          )}
          <div
            className="absolute inset-0 bg-black/50 flex flex-col justify-end p-2 rounded-md"
            style={{ borderRadius: "0.375rem" }}>
            <h3 className="text-white text-sm font-semibold text-left line-clamp-1 geist-bold">
              <span className="font-bold text-3xl">{index + 1}</span> -{" "}
              {movie.title}
            </h3>
          </div>
        </button>
        {auth?.currentUser && (
          <div className="absolute top-1 left-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 will-change-opacity">
            {bookmarks?.includes(movie.id.toString()) ? (
              <button
                className="p-1 bg-[rgba(255,255,255,0.1)] rounded-full text-red-500 hover:bg-red-500 hover:text-white focus:ring-2 focus:ring-red-500/50 transition-all duration-200"
                onClick={() =>
                  removeBookmarkMutation.mutate(movie.id.toString())
                }
                disabled={removeBookmarkMutation.isPending}
                aria-label={`Remove ${movie.title || "Unknown Title"} from bookmarks`}>
                <DeleteIcon />
              </button>
            ) : (
              <button
                className="p-1 bg-[rgba(255,255,255,0.1)] rounded-full text-white hover:bg-white hover:text-gray-900 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
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
                aria-label={`Add ${movie.title || "Unknown Title"} to bookmarks`}>
                <AddIcon />
              </button>
            )}
          </div>
        )}
      </Suspense>
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
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const queryClient = useQueryClient();
  const { addBookmarkMutation, removeBookmarkMutation } =
    useBookmarkMutations();
  const [featuredMovieId, setFeaturedMovieId] = useState<number | null>(null);

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

  // Handle initial loading state
  useEffect(() => {
    if (
      !isLoading &&
      !isDetailsLoading &&
      (featuredMovie || featuredMovieDetails)
    ) {
      setIsInitialLoading(false);
    }
  }, [isLoading, isDetailsLoading, featuredMovie, featuredMovieDetails]);

  // Set default featured movie to the first in the list
  useEffect(() => {
    if (!featuredMovieId && otherMovies.length > 0) {
      setFeaturedMovieId(otherMovies[0].id);
    }
  }, [featuredMovieId, otherMovies]);

  // Smooth scroll animation
  const smoothScrollTo = useCallback(
    (targetOffset: number, duration: number) => {
      const startOffset = scrollOffset;
      const startTime = performance.now();

      const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = progress * (2 - progress); // Ease-in-out
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
      const currentIndex = Math.round(scrollOffset / 190);
      const newIndex = Math.max(currentIndex - 1, 0);
      const newOffset = newIndex * 190;
      smoothScrollTo(newOffset, 500); // 500ms duration
    }
  }, [scrollOffset, smoothScrollTo]);

  const scrollRight = useCallback(() => {
    if (listRef.current) {
      const currentIndex = Math.round(scrollOffset / 190);
      const maxIndex = otherMovies.length - 1;
      const newIndex = Math.min(currentIndex + 1, maxIndex);
      const newOffset = newIndex * 190;
      smoothScrollTo(newOffset, 500); // 500ms duration
    }
  }, [scrollOffset, otherMovies.length, smoothScrollTo]);

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
          const newOffset = currentIndex * 190;
          smoothScrollTo(newOffset, 500); // 500ms duration
        }
      }, 300),
    [otherMovies, prefetchMovieDetails, smoothScrollTo]
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

  if (isInitialLoading) {
    return (
      <div className="relative w-full h-screen bg-black flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <section className="relative w-full h-screen bg-black text-white overflow-hidden flex flex-col md:flex">
        {/* Featured Movie Background */}
        <Suspense
          fallback={
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              <Loading />
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
              <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                <p className="text-gray-400">No backdrop available</p>
              </div>
            )}
          </div>
        </Suspense>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />

        {/* Featured Movie Content */}
        <Suspense
          fallback={
            <div className="relative flex-grow flex items-center justify-center z-20">
              <Loading />
            </div>
          }>
          <div className="relative flex-grow flex items-center justify-center z-20">
            {(featuredMovie || isDetailsLoading) && (
              <div className="absolute inset-0 flex flex-col items-center justify-end p-4 sm:p-6 lg:p-8 text-center">
                <h3 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl geist-bold capitalize">
                  {featuredMovieDetails?.original_title ||
                    featuredMovieDetails?.title ||
                    featuredMovie?.title ||
                    "Unknown"}
                </h3>
                <p className="text-red-500 text-xl sm:text-2xl md:text-3xl lg:text-4xl geist-bold capitalize mt-2">
                  {`Rank: ${getFeaturedMovieIndex() + 1}`}
                </p>
                <p className="text-gray-200 text-sm sm:text-base md:text-lg mt-2">
                  {featuredMovieDetails?.tagline || "No tagline available"}
                </p>
                <p className="text-gray-200 text-sm sm:text-base md:text-lg">
                  {formatDate(featuredMovieDetails?.release_date) ||
                    formatDate(featuredMovie?.release_date) ||
                    "N/A"}{" "}
                  • {formatRuntime(featuredMovieDetails?.runtime)} •{" "}
                  {featuredMovieDetails?.original_language?.toUpperCase() ||
                    "N/A"}
                </p>
                <p className="text-gray-300 text-sm sm:text-base max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mt-2">
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
                        onClick={() =>
                          removeBookmarkMutation.mutate(
                            featuredMovie?.id?.toString() || ""
                          )
                        }
                        disabled={removeBookmarkMutation.isPending}
                        aria-label={`Remove ${featuredMovie?.title || "Unknown Title"} from bookmarks`}>
                        <DeleteIcon />
                      </button>
                    ) : (
                      <button
                        className="bg-[#333]/50 backdrop-blur-md text-gray-100 px-4 sm:px-5 py-2 sm:py-3 rounded hover:scale-95 text-base sm:text-xl flex items-center justify-center"
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
                        aria-label={`Add ${featuredMovie?.title || "Unknown Title"} to bookmarks`}>
                        <AddIcon />
                      </button>
                    ))}
                </div>
                <p className="text-gray-200 text-xs sm:text-sm mt-2">
                  {featuredMovieDetails?.genres
                    ?.map((genre) => genre.name)
                    .join(" | ") || "N/A"}
                </p>
              </div>
            )}
          </div>
        </Suspense>

        {/* Scrollable Movie List */}
        <div className="w-full h-[120px] bg-gradient-to-t from-black via-black/50 to-transparent py-2 sm:py-4 z-20">
          {isError && (
            <p className="text-red-500 text-sm sm:text-base px-4 sm:px-6">
              Error:{" "}
              {error instanceof Error ? error.message : "An error occurred"}
            </p>
          )}
          {!isError && otherMovies.length > 0 && (
            <FixedSizeList
              ref={listRef}
              height={121}
              width={window.innerWidth}
              itemCount={otherMovies.length}
              itemSize={190}
              layout="horizontal"
              className="px-4 sm:px-6">
              {({ index, style }: ListChildComponentProps) => (
                <div style={{ ...style, scrollSnapAlign: "start" }}>
                  <MovieCard
                    movie={otherMovies[index]}
                    index={index}
                    style={{ width: "180px", height: "101px" }}
                    isSelected={otherMovies[index].id === featuredMovieId}
                    onClick={handleMovieClick}
                    bookmarks={bookmarks}
                    category={category}
                  />
                </div>
              )}
            </FixedSizeList>
          )}
        </div>

        {/* Scroll Buttons */}
        <div className="absolute bottom-28 right-2 flex gap-2 z-20">
          <button
            onClick={scrollLeft}
            aria-label="Scroll Left"
            className="bg-[rgba(255,255,255,0.1)] rounded-md p-2 sm:p-3.5 opacity-30 hover:opacity-80 hover:bg-blue-900/20 hover:scale-105 transition-all duration-200 will-change-transform ring-1 ring-blue-400/10 focus:ring-2 focus:ring-blue-500/50"
            disabled={scrollOffset === 0}>
            <LeftIcon />
          </button>
          <button
            onClick={scrollRight}
            aria-label="Scroll Right"
            className="bg-[rgba(255,255,255,0.1)] rounded-md p-2 sm:p-3.5 opacity-30 hover:opacity-80 hover:bg-blue-900/20 hover:scale-105 transition-all duration-200 will-change-transform ring-1 ring-blue-400/10 focus:ring-2 focus:ring-blue-500/50"
            disabled={scrollOffset >= (otherMovies.length - 1) * 190}>
            <RightIcon />
          </button>
        </div>
      </section>
    </ErrorBoundary>
  );
};

export default Display;
