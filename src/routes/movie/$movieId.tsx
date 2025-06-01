import { createFileRoute } from "@tanstack/react-router";
import BackHomeBtn from "@/components/BackHomeBtn";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMovieDetails,
  getMovieVideos,
  getMovieCredits,
  getMovieRecommendations,
} from "@/api/movie";
import Loading from "@/components/Loading";
import Modal from "@/components/Modal";
import { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { auth, db } from "@/config/firebase";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "sonner";
import CastCard from "@/components/CastCard";
import MediaCard from "@/components/MediaCard";
import Credits from "@/components/Credit";
import InfoSection from "@/components/InfoSection";

// Interfaces for type safety
interface MovieDetails {
  id: number;
  title: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average: number;
  release_date: string;
  runtime?: number;
  tagline?: string;
  overview?: string;
  homepage?: string;
  spoken_languages: { english_name: string; iso_639_1: string }[];
  genres: { id: number; name: string }[];
  production_companies: { id: number; name: string }[];
  production_countries: { name: string; iso_3166_1: string }[];
}

interface Video {
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
  id: string;
}

interface CastCardProps {
  id: number;
  name: string;
  profile_path?: string;
  character: string;
}

interface MovieProps {
  id: number;
  title: string;
  release_date: string;
  poster_path: string;
  vote_average: number;
}

export const Route = createFileRoute("/movie/$movieId")({
  loader: async ({ params }) => {
    return { movieId: params.movieId };
  },
  component: MovieDetails,
});

const FALLBACK_POSTER =
  "https://raw.githubusercontent.com/dumisa-sakhile/CinemaLand/main/public/poster.png";

function MovieDetails() {
  const { movieId } = Route.useLoaderData();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<import("firebase/auth").User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Movie details query
  const { data, isLoading, error } = useQuery<MovieDetails>({
    queryKey: ["movie", movieId],
    queryFn: () => getMovieDetails(movieId),
  });

  // Videos query
  const {
    data: videos,
    isLoading: videosLoading,
    error: videosError,
  } = useQuery<{
    results: Video[];
  }>({
    queryKey: ["movie-videos", movieId],
    queryFn: () => getMovieVideos(movieId),
  });

  // Credits query
  const { data: credits, isLoading: creditsLoading } = useQuery<{
    cast: CastCardProps[];
  }>({
    queryKey: ["movie-credits", movieId],
    queryFn: () => getMovieCredits(movieId),
  });

  // Recommendations query
  const { data: recommendations, isLoading: recommendationsLoading } =
    useQuery<{
      results: MovieProps[];
    }>({
      queryKey: ["movie-recommendations", movieId],
      queryFn: () => getMovieRecommendations(movieId),
    });

  // Bookmark query
  const { data: isBookmarked } = useQuery({
    queryKey: ["bookmarks", movieId, user?.uid ?? null],
    queryFn: async () => {
      if (!user) return false;
      const bookmarkRef = doc(db, "users", user.uid, "bookmarks", movieId);
      const docSnap = await getDoc(bookmarkRef);
      return docSnap.exists();
    },
    enabled: !!user,
  });

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      if (!data) throw new Error("Movie data not available");
      const bookmarkRef = doc(db, "users", user.uid, "bookmarks", movieId);

      if (isBookmarked) {
        await deleteDoc(bookmarkRef);
      } else {
        await setDoc(bookmarkRef, {
          id: data.id,
          title: data.title,
          poster_path: data.poster_path,
          vote_average: data.vote_average,
          release_date: data.release_date,
          category: "movie",
          addedAt: new Date().toISOString(),
        });
      }
    },
    onSuccess: () => {
      toast.success(isBookmarked ? "Bookmark removed!" : "Bookmark added!");
      queryClient.invalidateQueries({
        queryKey: ["bookmarks", movieId, user?.uid],
      });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleBookmark = () => {
    if (!user) {
      toast.error("Please login to bookmark movies");
      return;
    }
    bookmarkMutation.mutate();
  };

  // Format runtime (e.g., 125 minutes -> "2h 5m")
  const formatRuntime = (minutes?: number) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours ? `${hours}h ` : ""}${mins ? `${mins}m` : ""}`.trim();
  };

  // Select background video: prefer "Extended Preview", fallback to "Trailer"
  const videoUrl = videos?.results?.find(
    (video) =>
      video?.site === "YouTube" &&
      video?.key &&
      video?.type === "Extended Preview"
  )?.key
    ? `https://www.youtube.com/watch?v=${
        videos.results.find(
          (video) =>
            video?.site === "YouTube" &&
            video?.key &&
            video?.type === "Extended Preview"
        )?.key
      }`
    : videos?.results?.find(
          (video) =>
            video?.site === "YouTube" && video?.key && video?.type === "Trailer"
        )?.key
      ? `https://www.youtube.com/watch?v=${
          videos.results.find(
            (video) =>
              video?.site === "YouTube" &&
              video?.key &&
              video?.type === "Trailer"
          )?.key
        }`
      : null;

  // Set showVideo based on video availability
  useEffect(() => {
    if (!videosLoading && !videosError && videoUrl) {
      setShowVideo(true);
    } else {
      setShowVideo(false);
    }
  }, [videosLoading, videosError, videoUrl]);

  // Early return for loading or error state
  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error loading movie details: {error.message}</div>;
  }

  if (!data) {
    return <div>No movie data available</div>;
  }

  // Handle videos for Modal
  const modalVideos =
    videosLoading || videosError ? [] : (videos?.results ?? []);

  return (
    <>
      <Modal
        isShowing={modalOpen}
        hide={() => setModalOpen(false)}
        videos={modalVideos}
      />
      {/* Background: Video or Image */}
      {videosLoading ? (
        <div className="w-full h-full fixed -z-10 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-t-gray-100 border-gray-500 rounded-full animate-spin"></div>
        </div>
      ) : showVideo && videoUrl ? (
        <div className="fixed -z-10 w-full h-full overflow-hidden hidden lg:block">
          <ReactPlayer
            url={videoUrl}
            playing={true}
            loop={false}
            muted={true}
            controls={false}
            width="100%"
            height="100%"
            className="absolute transform scale-150"
            onEnded={() => setShowVideo(false)}
            config={{
              youtube: {
                playerVars: {
                  autoplay: 1,
                  controls: 0,
                  modestbranding: 1,
                  showinfo: 0,
                  rel: 0,
                },
              },
            }}
          />
        </div>
      ) : (
        <>
          {data.backdrop_path && (
            <img
              alt={data.title || "Movie Poster"}
              loading="lazy"
              width="1920"
              height="1080"
              decoding="async"
              className="w-full h-full object-cover fixed hidden lg:block -z-10"
              src={`https://image.tmdb.org/t/p/original/${data.backdrop_path}`}
            />
          )}
          {data.poster_path && (
            <img
              alt={data.title || "Movie Poster"}
              loading="lazy"
              width="1920"
              height="1080"
              decoding="async"
              className="w-full h-full object-cover fixed block lg:hidden -z-10"
              src={`https://image.tmdb.org/t/p/original/${data.poster_path}`}
            />
          )}
        </>
      )}

      {/* Movie details */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black via-black/60 to-transparent pt-[15%] p-4 md:pl-10 lg:pl-20 flex flex-col gap-8 pb-10">
        <BackHomeBtn />
        {/* Poster image: Show on mobile, or when video is not playing/unavailable */}
        {(videosLoading || !videoUrl || !showVideo) && data.poster_path && (
          <div className="relative md:static">
            <img
              src={
                data.poster_path
                  ? `https://image.tmdb.org/t/p/w500/${data.poster_path}`
                  : FALLBACK_POSTER
              }
              alt={data.title || "Movie Poster"}
              className="w-[250px] object-cover rounded relative left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:translate-none md:static"
            />
          </div>
        )}

        {/* Tagline */}
        {data.tagline && (
          <p className="text-white text-md geist-regular w-full md:w-1/2 lg:w-1/3">
            {data.tagline}
          </p>
        )}

        {/* Website, bookmark, videos */}
        <section className="flex gap-2 flex-wrap">
          {/* Website */}
          {data.homepage && (
            <a
              href={data.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white text-md roboto-condensed-light capitalize bg-[rgba(39,39,39,0.5)] backdrop-blur-sm rounded-full h-10 px-4 py-6 flex items-center gap-2 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95"
              aria-label="Visit movie website">
              <svg
                className="w-6 h-6 text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1"
                  d="M13.213 9.787a3.391 3.391 0 0 0-4.795 0l-3.425 3.426a3.39 3.39 0 0 0 4.795 4.794l.321-.304m-.321-4.49a3.39 3.39 0 0 0 4.795 0l3.424-3.426a3.39 3.39 0 0 0-4.794-4.795l-1.028.961"
                />
              </svg>
              <span className="text-md roboto-condensed-light capitalize">
                website
              </span>
            </a>
          )}

          {/* Bookmark */}
          <button
            onClick={handleBookmark}
            disabled={bookmarkMutation.isPending}
            aria-label={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
            className="text-white text-md roboto-condensed-light capitalize bg-[rgba(39,39,39,0.5)] backdrop-blur-sm rounded h-10 px-4 py-6 flex items-center gap-2 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95">
            {bookmarkMutation.isPending ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <>
                <svg
                  className="w-6 h-6 text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={isBookmarked ? "1.6" : "1"}
                    d={
                      isBookmarked
                        ? "M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"
                        : "m17 21-5-4-5 4V3.889a.92.92 0 0 1 .244-.629.808.808 0 0 1 .59-.26h8.333a.81.81 0 0 1 .589.26.92.92 0 0 1 .244.63V21Z"
                    }
                  />
                </svg>
                <span className="text-md roboto-condensed-light capitalize">
                  {isBookmarked ? "Remove Bookmark" : "Bookmark"}
                </span>
              </>
            )}
          </button>

          {/* Videos collection */}
          <button
            className="text-white text-md roboto-condensed-light capitalize bg-[rgba(39,39,39,0.5)] backdrop-blur-sm rounded h-10 px-4 py-6 flex items-center gap-2 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95"
            onClick={() => setModalOpen(true)}
            aria-label="Open videos collection">
            <svg
              className="w-6 h-6 text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                d="M14 6H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1Zm7 11-6-2V9l6-2v10Z"
              />
            </svg>
            <span className="text-md roboto-condensed-light capitalize">
              videos collection
            </span>
          </button>
        </section>

        {/* Release, rating, duration */}
        <article className="flex items-center flex-wrap gap-4 geist-regular text-sm">
          {data.release_date && (
            <p className="flex items-center gap-2">
              Released:{" "}
              <span className="text-[#FACC15]">{data.release_date}</span>
            </p>
          )}
          {data.vote_average && (
            <p className="flex items-center gap-2">
              <svg
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="star"
                className="w-5 h-5"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 576 512"
                style={{ color: "#FFD43B" }}>
                <path
                  fill="currentColor"
                  d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"
                />
              </svg>
              <span className="text-[#FACC15]">
                {data.vote_average.toFixed(1)}/10
              </span>
            </p>
          )}
          {data.runtime && (
            <p className="flex items-center gap-2">
              Duration:{" "}
              <span className="text-[#FACC15]">
                {formatRuntime(data.runtime)}
              </span>
            </p>
          )}
        </article>

        {/* Description */}
        {data.overview && (
          <p className="text-white text-md roboto-condensed-light w-full md:w-1/2 lg:w-1/2 bg-[rgba(0,0,0,0.2)] backdrop-blur-sm rounded px-4 py-6 ring-1 ring-gray-900/50 hover:ring-gray-900/50 transition duration-300 ease-in-out transform">
            <span className="font-bold">Description: </span> {data.overview}
          </p>
        )}

        {data?.spoken_languages && (
          <InfoSection
            title="Languages"
            items={data.spoken_languages.map(({ english_name, iso_639_1 }) => ({
              id: iso_639_1,
              name: english_name,
            }))}
            typeKey="with_original_language"
          />
        )}

        {data?.genres && (
          <InfoSection
            title="Genre"
            items={data.genres.map(({ name, id }) => ({ id, name }))}
            typeKey="with_genres"
          />
        )}

        {data?.production_companies && (
          <InfoSection
            title="Production Companies"
            items={data.production_companies.map(({ name, id }) => ({
              id,
              name,
            }))}
            typeKey="with_companies"
          />
        )}

        {data?.production_countries && (
          <InfoSection
            title="Production Countries"
            items={data.production_countries.map(({ name, iso_3166_1 }) => ({
              id: iso_3166_1,
              name,
            }))}
            typeKey="with_origin_country"
          />
        )}

        {/* Cast section */}
        <Credits creditsLoading={creditsLoading}>
          {credits?.cast?.map((cast) => (
            <div key={cast.id}>
              <CastCard
                name={cast.name}
                id={cast.id}
                profile_path={cast.profile_path}
                character={cast.character}
              />
            </div>
          ))}
        </Credits>

        {/* Recommendations section */}
        <h1 className="text-2xl md:text-5xl text-left geist-bold">
          Recommendations
        </h1>
        <section className="w-full min-h-1/2 md:p-4 flex flex-wrap items-start justify-center gap-2 lg:gap-10">
          {recommendations?.results.length === 0 && (
            <p>No recommendations available</p>
          )}
          {recommendationsLoading && <Loading />}
          {recommendations?.results?.map(
            ({ id, title, release_date, poster_path, vote_average }) => (
              <MediaCard
                key={id}
                id={id}
                title={title}
                release_date={release_date}
                poster_path={poster_path}
                vote_average={vote_average}
                type="movie"
              />
            )
          )}
        </section>
        <br />
        <br />
        <br />
        <br />
      </div>
    </>
  );
}
