// Removed duplicate Route definition and RouteComponent
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
import { useState, useEffect } from "react";
import { auth, db } from "@/config/firebase";
import { doc, getDoc  } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import CastCard from "@/components/CastCard";
import MediaCard from "@/components/MediaCard";
import Credits from "@/components/Credit";
import InfoSection from "@/components/InfoSection";
import {
  VoteIcon,
  WebsiteIcon,
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
// Interfaces for type safety

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
        // Filter English logos
        const englishLogos = logos?.filter((logo) => logo?.iso_639_1 === "en");
        // Return highest vote_average English logo, or highest vote_average overall if no English logos
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
      />

      {/* Movie details */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black via-black/60 to-transparent pt-[15%] p-4 md:pl-10 lg:pl-20 flex flex-col gap-8">
        <BackHomeBtn />
        {/* Poster image: Show on mobile, or when video is not playing/unavailable */}
        {(videosLoading || !videoUrl || !showVideo) && data?.poster_path && (
          <div className="relative md:static">
            <img
              src={
                data?.poster_path
                  ? `https://image.tmdb.org/t/p/w500/${data?.poster_path}`
                  : FALLBACK_POSTER
              }
              alt={data?.title || "Movie Poster"}
              className="w-[250px] object-cover rounded relative left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:translate-none md:static"
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
          <p className="text-white text-md geist-regular w-full md:w-1/2 lg:w-1/3">
            {data?.tagline}
          </p>
        )}

        {/* Website, bookmark, videos */}
        <section className="flex gap-2 flex-wrap">
          {/* Website */}
          {data?.homepage && (
            <a
              href={data?.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="text-md roboto-condensed-light capitalize bg-[#333]/50 backdrop-blur-md text-base text-gray-100 rounded-full h-10 px-4 py-6 flex items-center gap-2 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95"
              aria-label="Visit movie website">
              <WebsiteIcon />
              <span className="text-md roboto-condensed-light capitalize">
                website
              </span>
            </a>
          )}

          {/* Bookmark */}
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

         
        </section>

        {/* Release, rating, duration */}
        <article className="flex items-center flex-wrap gap-4 geist-regular text-sm">
          {data?.release_date && (
            <p className="flex items-center gap-2">
              Released: <span className="font-bold">{data?.release_date}</span>
            </p>
          )}
          {data?.vote_average && (
            <p className="flex items-center gap-2">
              <VoteIcon />
              <span className="font-bold">
                {data?.vote_average?.toFixed(1)}/10
              </span>
            </p>
          )}
          {data?.runtime && (
            <p className="flex items-center gap-2">
              Duration:{" "}
              <span className="font-bold">{formatRuntime(data?.runtime)}</span>
            </p>
          )}
        </article>

        {/* Description */}
        {data?.overview && (
          <p className="text-white text-md roboto-condensed-light w-full md:w-1/2 lg:w-1/2 bg-[rgba(0,0,0,0.2)] backdrop-blur-sm rounded px-4 py-6 ring-1 ring-gray-900/50 hover:ring-gray-900/50 transition duration-300 ease-in-out transform">
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
        <h1 className="text-2xl md:text-5xl text-left geist-bold">
          Recommendations
        </h1>
        <section className="w-full min-h-1/2 md:p-4 flex flex-wrap items-start justify-center gap-2 lg:gap-10">
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
