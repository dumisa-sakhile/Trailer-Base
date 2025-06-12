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
import {
  MuteIcon,
  ReplayIcon,
  UnMuteIcon,
  VoteIcon,
  WebsiteIcon,
  YouTubeIcon,
} from "@/components/icons/Icons";
import BookmarkButton from "@/components/BookmarkButton";
import LogoDisplay from "@/components/LogoDisplay";
import BackgroundMedia from "@/components/BackgroundMedia";
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
    if (!minutes) return "N/A";
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
        <div className="absolute bottom-24 right-4 hidden md:flex gap-2 z-20 group">
          {showVideo && (
            <button
              onClick={onToggleMute}
              className="text-md  capitalize backdrop-blur-md bg-black text-base text-gray-100 rounded-full h-10 px-4 py-6 flex items-center gap-2 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95 ring-1 ring-white/10 "
              aria-label={isMuted ? "Unmute video" : "Mute video"}
              tabIndex={0}>
              {isMuted ? <MuteIcon /> : <UnMuteIcon />}
            </button>
          )}
          {showReplay && !showVideo && (
            <button
              onClick={onReplay}
              className="text-md  capitalize backdrop-blur-md text-base text-gray-100 rounded-full h-10 px-4 py-6 flex items-center gap-2 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95 ring-1 ring-white/10"
              aria-label="Replay video"
              tabIndex={0}>
              <ReplayIcon />
            </button>
          )}
        </div>
      )}

      {/* Movie details */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black via-black/60 to-transparent pt-[25%] p-4 md:pl-20 lg:pl-20 flex flex-col gap-8 pb-10">
        <BackHomeBtn />
        {/* Poster image: Show on mobile, or when video is not playing/unavailable */}
        {(videosLoading || !videoUrl || !showVideo ) &&
          data?.poster_path && (
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

        {/* Poster image: Show on mobile as a result of the video hidden by default */}
        {data?.poster_path && (
          <div className="md:hidden relative md:static group">
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
        <div>
          <LogoDisplay
            isVideoPlaying={showVideo}
            logosLoading={logosLoading}
            logosError={!!logosError}
            selectedLogo={selectedLogo}
            title={data?.title || "Movie Title"}
          />
        </div>

        {/* Tagline */}
        {data?.tagline && (
          <p className="text-white text-lg  w-full md:w-1/2 lg:w-1/3">
            {data?.tagline}
          </p>
        )}

        {/* Website, bookmark */}
        <section className="flex gap-2 flex-wrap">
          {data?.release_date && (
            <span className="button-style">
              {new Date(data.release_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          )}
          {data?.vote_average && (
            <p className="flex items-center gap-2 button-style">
              <VoteIcon />
              <span className="font-bold">
                {data?.vote_average?.toFixed(1)}/10
              </span>
            </p>
          )}

          {data?.runtime && (
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
              <WebsiteIcon />
              <span className="text-md  capitalize">website</span>
            </a>
          )}
          <BookmarkButton
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

          {/* YouTube link */}
          {videoUrl && (
            <a href={videoUrl || ""} target="_blank" className="button-style">
              <YouTubeIcon />
              YouTube
            </a>
          )}
        </section>

        {/* Description */}
        {data?.overview && (
          <p className="text-white text-lg  w-full md:w-1/2 lg:w-1/2  backdrop-blur-sm rounded px-4 py-6  transition duration-300 ease-in-out transform">
            <span className="font-bold">Description: </span> {data?.overview}
          </p>
        )}

        {data?.spoken_languages && (
          <InfoSection
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
            title="Genre"
            items={data?.genres?.map(({ name, id }) => ({ id, name }))}
            typeKey="with_genres"
          />
        )}

        {data?.production_companies && (
          <InfoSection
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
        <section className="w-full min-h-1/2 md:p-4 flex flex-wrap items-start justify-center gap-2 md:gap-10 pb-10">
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
        </section>

        <br />
        <br />
        <br />
        <br />
      </div>
    </>
  );
}
