import { Link } from "@tanstack/react-router";
import React, { useRef, useState, useMemo, Suspense } from "react";
import Loading from "@/components/Loading";
import { useQuery } from "@tanstack/react-query";
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
}

interface DisplayProps {
  data?: { results: MovieProps[] };
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  category: "movie" | "tv";
}

const Display: React.FC<DisplayProps> = ({
  data,
  isLoading,
  isError,
  error,
  category,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addBookmarkMutation, removeBookmarkMutation } =
    useBookmarkMutations();
  const [featuredMovieId, setFeaturedMovieId] = useState<number | null>(
    data?.results?.[0]?.id ?? 1233413
  );

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
    queryFn: () => getMovieDetails(featuredMovieId!.toString()),
    enabled: !!featuredMovieId,
  });

  const featuredMovie = data?.results?.find(
    (movie) => movie.id === featuredMovieId
  );
  const otherMovies = data?.results || [];

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const handleMovieClick = (id: number) => {
    setFeaturedMovieId(id);
  };

  const getGenreNames = useMemo(() => {
    return (genres?: { id: number; name: string }[], genreIds?: number[]) => {
      if (genres?.length) return genres.map((g) => g.name).join(" | ");
      return genreIds?.join(" | ") || "N/A";
    };
  }, []);

  const getFeaturedMovieIndex = () => {
    return data?.results?.findIndex((movie) => movie.id === featuredMovieId) ?? -1;
  };

  return (
    <section className="relative w-full h-[calc(100vh-80px)] sm:h-screen bg-black text-white overflow-hidden flex flex-col">
      {/* Featured Movie Background */}
      <div className="absolute inset-0 w-full h-full">
        {featuredMovie?.backdrop_path ? (
          <Suspense fallback={<Loading />}>
            <img
              src={`https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path}`}
              alt={featuredMovie.title || "Featured Movie"}
              className="w-full h-full object-cover max-h-screen"
              loading="lazy"
              style={{ borderRadius: "0" }}
            />
          </Suspense>
        ) : (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            <p className="text-gray-400">No backdrop available</p>
          </div>
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10"></div>

      {/* Featured Movie Content */}
      <div className="relative w-full h-3/4 sm:h-4/5 flex items-center justify-center z-20">
        {(featuredMovie || isDetailsLoading) && (
          <div className="relative w-full h-full overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <div className="absolute inset-0 flex flex-col items-center justify-end p-4 sm:p-6 lg:p-8 text-center">
                <h3 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase">
                  {featuredMovieDetails?.title ||
                    featuredMovie?.title ||
                    "Unknown"}
                </h3>
                <p className="text-red-500 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold uppercase mt-2">
                  {`Rank: ${getFeaturedMovieIndex() + 1}`}
                </p>
                <p className="text-gray-300 text-sm sm:text-base md:text-lg mt-2">
                  Trending Today
                </p>
                <p className="text-gray-300 text-sm sm:text-base md:text-lg">
                  {featuredMovieDetails?.release_date ||
                    featuredMovie?.release_date ||
                    "N/A"}{" "}
                  • 12+ • English
                </p>
                <p className="text-gray-400 text-sm sm:text-base max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mt-2">
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
                        className="bg-red-600 text-white px-4 sm:px-5 py-2 sm:py-3 rounded hover:bg-red-700 text-base sm:text-xl flex items-center justify-center focus:ring-2 focus:ring-red-500"
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
                <p className="text-gray-300 text-xs sm:text-sm mt-2">
                  {getGenreNames(
                    featuredMovieDetails?.genres,
                    featuredMovie?.genre_ids
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Movie List */}
      <div
        className="overflow-x-scroll w-full h-1/4 sm:h-1/5 bg-gradient-to-t from-black via-black/50 to-transparent scrollbar-hide py-2 sm:py-4 z-20"
        ref={scrollRef}>
        <div className="flex gap-2 sm:gap-3 px-4 sm:px-6">
          {isLoading && <Loading />}
          {isError && (
            <p className="text-red-500 text-sm sm:text-base">
              Error:{" "}
              {error instanceof Error ? error.message : "An error occurred"}
            </p>
          )}
          {otherMovies.map(
            (
              {
                id,
                title,
                release_date,
                backdrop_path,
                poster_path,
                vote_average,
              }: MovieProps,
              index
            ) => (
              <div
                className={`relative group`} // Removed filter grayscale
                key={id}>
                <button
                  onClick={() => handleMovieClick(id)}
                  className={`w-[150px] sm:w-[180px] md:w-[230px] h-[84px] sm:h-[101px] md:h-[129px] flex-none overflow-hidden shadow-md focus:outline-none rounded-md ${id === featuredMovieId ? "border-2 border-blue-500" : ""}`} // Added rounded-md and conditional blue border
                  style={{ borderRadius: "0.375rem" }} // Ensure medium border-radius (matches rounded-md)
                >
                  <Suspense fallback={<Loading />}>
                    {backdrop_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w780${backdrop_path}`}
                        alt={title || "Movie"}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        style={{ borderRadius: "0.375rem" }} // Match parent border-radius
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-900 flex items-center justify-center rounded-md">
                        {" "}
                        {/* Added rounded-md to no-backdrop div */}
                        <p className="text-gray-500 text-xs sm:text-sm">
                          No backdrop
                        </p>
                      </div>
                    )}
                  </Suspense>
                  <div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-2 rounded-md">
                    {" "}
                    {/* Added rounded-md to overlay */}
                    <h3 className="text-white text-xs sm:text-sm font-semibold text-left line-clamp-1">
                      {index + 1}. {title}
                    </h3>
                  </div>
                </button>
                {auth?.currentUser && (
                  <div className="absolute top-1 sm:top-1.5 left-1 sm:left-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {bookmarks?.includes(id.toString()) ? (
                      <button
                        className="p-1 bg-[rgba(255,255,255,0.1)] rounded-full text-red-500 hover:bg-red-500 hover:text-white focus:ring-2 focus:ring-red-500/50 transition-all duration-300 ease-in-out shadow-sm"
                        onClick={() =>
                          removeBookmarkMutation.mutate(id.toString())
                        }
                        disabled={removeBookmarkMutation.isPending}
                        aria-label={`Remove ${title || "Unknown Title"} from bookmarks`}>
                        <DeleteIcon />
                      </button>
                    ) : (
                      <button
                        className="p-1 bg-[rgba(255,255,255,0.1)] rounded-full text-white hover:bg-white hover:text-gray-900 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ease-in-out shadow-sm"
                        onClick={() =>
                          addBookmarkMutation.mutate({
                            id,
                            title,
                            poster_path,
                            vote_average,
                            release_date,
                            category,
                          })
                        }
                        disabled={addBookmarkMutation.isPending || !poster_path}
                        aria-label={`Add ${title || "Unknown Title"} to bookmarks`}>
                        <AddIcon />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>

      {/* Scroll Buttons */}
      <div className="absolute bottom-48 right-2 transform -translate-x-1/2 flex gap-2 z-20">
        <button
          onClick={scrollLeft}
          aria-label="Scroll Left"
          className="bg-[rgba(255,255,255,0.1)] rounded-md p-2 sm:p-3.5 opacity-0.3 hover:opacity-80 hover:bg-blue-900/20 hover:scale-105 transition-all duration-300 ease-in-out ring-1 ring-blue-400/10 focus:ring-2 focus:ring-blue-500/50">
          <LeftIcon />
        </button>
        <button
          onClick={scrollRight}
          aria-label="Scroll Right"
          className="bg-[rgba(255,255,255,0.1)] rounded-md p-2 sm:p-3.5 opacity-0.3 hover:opacity-80 hover:bg-blue-900/20 hover:scale-105 transition-all duration-300 ease-in-out ring-1 ring-blue-400/10 focus:ring-2 focus:ring-blue-500/50">
          <RightIcon />
        </button>
      </div>
    </section>
  );
};

export default Display;