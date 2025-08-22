import { createFileRoute } from "@tanstack/react-router";
import BackHomeBtn from "@/components/BackHomeBtn";
import { useQuery } from "@tanstack/react-query";
import {
  getMovieDetails,
  getMovieVideos,
  getMovieCredits,
  getMovieRecommendations,
  getMovieImages,
} from "@/api/movie";
import Loading from "@/components/Loading";
import { useState, useEffect, useCallback } from "react";
import { auth, db } from "@/config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import CastCard from "@/components/CastCard";
import MediaCard from "@/components/MediaCard";
import Credits from "@/components/Credit";
import InfoSection from "@/components/InfoSection";
import BookmarkButton from "@/components/BookmarkButton";
import LogoDisplay from "@/components/LogoDisplay";
import BackgroundMedia from "@/components/BackgroundMedia";
import MobileVideoModal from "@/components/MobileVideoModal";
import {
  Volume2,
  VolumeX,
  RotateCcw,
  ThumbsUp,
  Globe,
} from "lucide-react";
import type {
  Video,
  MovieDetails,
  CastCardProps,
  MovieProps,
  MovieImage,
} from "@/Types/movieInterfaces";

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
  const [user, setUser] = useState<import("firebase/auth").User | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showReplay, setShowReplay] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [modalMuted, setModalMuted] = useState(true);

  // Handle mute toggle
  const onToggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // Handle replay
  const onReplay = useCallback(() => {
    setShowReplay(false);
    setShowVideo(true);
  }, []);

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

  // Movie logos query
  const {
    data: logos,
    isLoading: logosLoading,
    error: logosError,
  } = useQuery<MovieImage[]>({
    queryKey: ["movie-logos", movieId],
    queryFn: () => getMovieImages(movieId),
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

  // Update showReplay when video ends
  useEffect(() => {
    if (
      !showVideo &&
      !videosLoading &&
      !videosError &&
      videos?.results?.length
    ) {
      setShowReplay(true);
    } else {
      setShowReplay(false);
    }
  }, [showVideo, videosLoading, videosError, videos]);

  // Format runtime (e.g., 125 minutes -> "2h 5m")
  const formatRuntime = useCallback((minutes?: number) => {
    if (minutes === undefined) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours ? `${hours}h ` : ""}${mins ? `${mins}m` : ""}`.trim();
  }, []);

  // Select background video: prefer "Extended Preview", fallback to "Trailer"
  const videoUrl = videos?.results?.find(
    (video) =>
      video?.site === "YouTube" &&
      video?.key &&
      video?.type === "Extended Preview"
  )?.key
    ? `https://www.youtube.com/watch?v=${
        videos?.results?.find(
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
          videos?.results?.find(
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

  // Select the best logo: highest vote_average
  const selectedLogo = logos?.length
    ? (() => {
        const englishLogos = logos?.filter((logo) => logo?.iso_639_1 === "en");
        const logoPool = englishLogos?.length > 0 ? englishLogos : logos;
        return logoPool?.reduce((prev, curr) =>
          prev?.vote_average > curr?.vote_average ? prev : curr
        );
      })()
    : undefined;

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

  return (
    <>
      {/* Background: Video or Image */}
      <BackgroundMedia
        videosLoading={videosLoading}
        showVideo={showVideo}
        videoUrl={videoUrl}
        backdropPath={data?.backdrop_path ?? null}
        posterPath={data?.poster_path ?? null}
        title={data?.title ?? null}
        setShowVideo={setShowVideo}
        isMuted={isMuted}
        showReplay={showReplay}
        onToggleMute={onToggleMute}
        onReplay={onReplay}
      />

      {/* Control Buttons */}
      {videoUrl && (
        <div className="absolute bottom-16 right-6 hidden md:flex gap-3 z-20 group">
          {showVideo && (
            <button
              onClick={onToggleMute}
              className="backdrop-blur-md bg-black/80 text-base text-gray-100 rounded-full h-12 w-12 flex items-center justify-center hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95 ring-1 ring-white/10"
              aria-label={isMuted ? "Unmute video" : "Mute video"}
              tabIndex={0}>
              {isMuted ? <VolumeX size={28} /> : <Volume2 size={28} />}
            </button>
          )}
          {showReplay && !showVideo && (
            <button
              onClick={onReplay}
              className="backdrop-blur-md bg-black/80 text-base text-gray-100 rounded-full h-12 w-12 flex items-center justify-center hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95 ring-1 ring-white/10"
              aria-label="Replay video"
              tabIndex={0}>
              <RotateCcw size={28} />
            </button>
          )}
        </div>
      )}

      {/* Movie details */}
      <div
        className={
          `fixed top-0 left-0 w-full h-full bg-gradient-to-t from-black via-black/60 to-transparent pt-[170px] ` +
          `${showVideo ? "md:pt-[45%]" : "md:pt-[15%]"} ` +
          `p-4 md:pl-20 lg:pl-20 flex flex-col gap-8 overflow-auto md:poppins-light`
        }>
        <BackHomeBtn />
        {/* Poster image: Show on mobile, or when video is not playing/unavailable */}
        {(videosLoading || !videoUrl || !showVideo) && data?.poster_path && (
          <div className="hidden md:flex relative md:static">
            <img
              src={
                data?.poster_path
                  ? `https://image.tmdb.org/t/p/w500/${data?.poster_path}`
                  : FALLBACK_POSTER
              }
              alt={data?.title || "Movie Poster"}
              className="w-[250px] object-cover rounded-2xl relative left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:translate-none md:static transition-transform duration-300 ease-in-out group-hover:scale-110 group-hover:rotate-2"
            />
          </div>
        )}

        {/* Logo */}
        <div className="hidden md:flex">
          <LogoDisplay
            isVideoPlaying={showVideo}
            logosLoading={logosLoading}
            logosError={!!logosError}
            selectedLogo={selectedLogo}
            title={data?.title || "Movie Title"}
          />
        </div>

        {/* Centered logo above tagline on mobile */}
        {selectedLogo && (
          <div className="flex md:hidden justify-center mb-4">
            <img
              src={`https://image.tmdb.org/t/p/w500/${selectedLogo?.file_path}`}
              alt={`${data?.title || "Movie logo"} Logo`}
              className="w-[150px] h-auto object-contain"
            />
          </div>
        )}

        {/* Tagline */}
        {data?.tagline && (
          <p className="text-center md:text-left text-gray-white text-base mb-4">
            {data.tagline}
          </p>
        )}

        {/* play trailer fixed bottom button on mobile */}
        <div className="relative w-full flex items-center justify-center">
          <button
            className="bg-blue-600 text-white px-6 sm:px-8 py-4 rounded hover:bg-blue-700 text-base sm:text-xl flex items-center justify-center md:hidden focus:ring-1 focus:ring-blue-500 fixed bottom-5 capitalize z-10 min-w-[300px]"
            onClick={() => setShowMobileModal(true)}>
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 inline-block mr-2"
              fill="currentColor"
              viewBox="0 0 24 24">
              <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.68L9.54 5.98C8.87 5.55 8 6.03 8 6.82z" />
            </svg>
            Watch Trailer
          </button>
        </div>

        {/* Website, bookmark, and release date */}
        <section className="flex gap-2 flex-wrap items-center justify-center md:justify-start md:items-start">
          {data?.release_date && (
            <span className="button-style">
              {new Date(data.release_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          )}
          {(data?.vote_average as number) > 1 && (
            <p className="flex items-center gap-2 button-style">
              <ThumbsUp />
              <span className="font-bold">
                {data?.vote_average?.toFixed(1)}/10
              </span>
            </p>
          )}

          {(data?.runtime as number) > 1 && (
            <p className="button-style">
              Duration:{" "}
              <span className="font-bold">{formatRuntime(data?.runtime)}</span>
            </p>
          )}

          {data?.homepage && (
            <a
              href={data?.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="button-style">
              <Globe />
              <span className="text-md  capitalize">website</span>
            </a>
          )}
          <BookmarkButton
            mediaType="movie"
            user={user}
            movieId={movieId}
            movieData={{
              id: data.id,
              title: data.title,
              poster_path: data.poster_path,
              vote_average: data.vote_average,
              release_date: data.release_date,
            }}
            isBookmarked={!!isBookmarked}
          />
        </section>

        {/* Description */}
        {data?.overview && (
          <p className="text-white text-lg  w-full lg:max-w-[800px] text-center md:text-left  backdrop-blur-sm rounded px-4 py-6  transition duration-300 ease-in-out transform">
            <span className="font-bold">Description: </span> {data?.overview}
          </p>
        )}

        {data?.spoken_languages && (
          <InfoSection
            mediaType="movie"
            title="Languages"
            items={data?.spoken_languages?.map(
              ({ english_name, iso_639_1 }) => ({
                id: iso_639_1,
                name: english_name,
              })
            )}
            typeKey="with_original_language"
          />
        )}

        {data?.genres && (
          <InfoSection
            mediaType="movie"
            title="Genre"
            items={data?.genres?.map(({ name, id }) => ({ id, name }))}
            typeKey="with_genres"
          />
        )}

        {data?.production_companies && (
          <InfoSection
            mediaType="movie"
            title="Production Companies"
            items={data?.production_companies?.map(({ name, id }) => ({
              id,
              name,
            }))}
            typeKey="with_companies"
          />
        )}

        {data?.production_countries && (
          <InfoSection
            mediaType="movie"
            title="Production Countries"
            items={data?.production_countries?.map(({ name, iso_3166_1 }) => ({
              id: iso_3166_1,
              name,
            }))}
            typeKey="with_origin_country"
          />
        )}

        <br />

        {/* Cast section */}
        <Credits creditsLoading={creditsLoading}>
          {credits?.cast?.map((cast) => (
            <div key={cast?.id}>
              <CastCard
                name={cast?.name}
                id={cast?.id}
                profile_path={cast?.profile_path}
                character={cast?.character}
              />
            </div>
          ))}
        </Credits>

        {/* Recommendations section */}
        <h1 className="text-3xl max-sm:text-2xl lg:text-4xl font-medium tracking-tight ">
          Recommendations
        </h1>
        <section className="relative w-full min-h-1/2 md:p-4 flex flex-wrap items-start justify-center gap-2 md:gap-10">
          {recommendations?.results?.length === 0 && (
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
          <div className="w-full h-[50px]">
            {/* {empty div to provide spacing at the bottom of the section as this is the last element on the page} */}
          </div>
        </section>
      </div>

      {/* Mobile Video Modal */}
      <MobileVideoModal
        open={showMobileModal}
        onClose={() => setShowMobileModal(false)}
        videoUrl={videoUrl ?? ""}
        isMuted={modalMuted}
        onToggleMute={() => setModalMuted((m) => !m)}
      />
    </>
  );
}

export default MovieDetails;
