import { createFileRoute, Link } from "@tanstack/react-router";
import BackHomeBtn from "@/components/BackHomeBtn";
import { useQuery } from "@tanstack/react-query";
import {
  getTVDetails,
  getTVVideos,
  getTVCredits,
  getTVRecommendations,
  getTVImages,
} from "@/api/tv";
import Loading from "@/components/Loading";
import { useState, useEffect, useCallback } from "react";
import { auth, db } from "@/config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import CastCard from "@/components/CastCard";
import MediaCard from "@/components/MediaCard";
import Credits from "@/components/Credit";
import SeasonsSection from "@/components/SeasonsSection";
import InfoTvSection from "@/components/InfoTvSection";
import {
  MuteIcon,
  UnMuteIcon,
  ReplayIcon,
  WebsiteIcon,
  CreatorIcon,
  StarIcon,
  YouTubeIcon,
} from "@/components/icons/Icons";
import BackgroundMedia from "@/components/BackgroundMedia";
import TvLogoDisplay from "@/components/TvLogoDisplay";
import TvBookmarkBtn from "@/components/TvBookmarkBtn";
import type {
  TVDetails,
  Video,
  MediaImage,
  TVProps,
  CastCardProps,
} from "@/Types/tvInterfaces";

export const Route = createFileRoute("/tv/$tvId")({
  loader: async ({ params }) => {
    return { tvId: params?.tvId };
  },
  component: TVDetails,
});

const FALLBACK_POSTER =
  "https://raw.githubusercontent.com/dumisa-sakhile/CinemaLand/main/public/poster.png";

function TVDetails() {
  const { tvId } = Route.useLoaderData();
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

  // TV details query
  const { data, isLoading, error } = useQuery<TVDetails>({
    queryKey: ["tv", tvId],
    queryFn: () => getTVDetails(tvId),
  });

  // Videos query
  const {
    data: videos,
    isLoading: videosLoading,
    error: videosError,
  } = useQuery<{
    results: Video[];
  }>({
    queryKey: ["tv-videos", tvId],
    queryFn: () => getTVVideos(tvId),
  });

  // Credits query
  const { data: credits, isLoading: creditsLoading } = useQuery<{
    cast: CastCardProps[];
  }>({
    queryKey: ["tv-credits", tvId],
    queryFn: () => getTVCredits(tvId),
  });

  // Recommendations query
  const { data: recommendations, isLoading: recommendationsLoading } =
    useQuery<{
      results: TVProps[];
    }>({
      queryKey: ["tv-recommendations", tvId],
      queryFn: () => getTVRecommendations(tvId),
    });

  // TV logos query
  const {
    data: logos,
    isLoading: logosLoading,
    error: logosError,
  } = useQuery<MediaImage[]>({
    queryKey: ["tv-logos", tvId],
    queryFn: () => getTVImages(tvId),
  });

  // Bookmark query
  const { data: isBookmarked } = useQuery({
    queryKey: ["bookmarks", tvId, user?.uid ?? null],
    queryFn: async () => {
      if (!user) return false;
      const bookmarkRef = doc(db, "users", user?.uid, "bookmarks", tvId);
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

  // Preload fallback images
  useEffect(() => {
    if (data?.backdrop_path) {
      const img = new Image();
      img.src = `https://image.tmdb.org/t/p/original/${data?.backdrop_path}`;
    }
    if (data?.poster_path) {
      const img = new Image();
      img.src = `https://image.tmdb.org/t/p/original/${data?.poster_path}`;
    }
  }, [data?.backdrop_path, data?.poster_path]);

  // Set showVideo based on video availability
  useEffect(() => {
    if (!videosLoading && !videosError && videoUrl) {
      console.log("Video ready, showing ReactPlayer:", videoUrl);
      setShowVideo(true);
    } else {
      console.log("No video or loading/error, showing images");
      setShowVideo(false);
    }
  }, [videosLoading, videosError, videoUrl]);

  // Select the best logo: highest vote_average
  const selectedLogo = logos?.length
    ? (() => {
        const englishLogos = logos.filter((logo) => logo.iso_639_1 === "en");
        const logoPool = englishLogos.length > 0 ? englishLogos : logos;
        return logoPool.reduce((prev, curr) =>
          prev.vote_average > curr.vote_average ? prev : curr
        );
      })()
    : undefined;

  // Early return for loading or error state
  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error loading TV show details: {error.message}</div>;
  }

  if (!data) {
    return <div>No TV show data available</div>;
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
        title={data?.name}
        setShowVideo={setShowVideo}
        isMuted={isMuted}
        showReplay={showReplay}
        onToggleMute={onToggleMute}
        onReplay={onReplay}
      />

      {/* Control Buttons */}
      <div className="absolute bottom-24 right-4 flex gap-2 z-20 group">
        {showVideo && (
          <button
            onClick={onToggleMute}
            className="text-md roboto-condensed-light capitalize backdrop-blur-md text-base text-gray-100 rounded-full h-10 px-4 py-6 flex items-center gap-2 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95 ring-1 ring-white/10"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
            tabIndex={0}>
            {isMuted ? <MuteIcon /> : <UnMuteIcon />}
          </button>
        )}
        {showReplay && !showVideo && (
          <button
            onClick={onReplay}
            className="text-md roboto-condensed-light capitalize backdrop-blur-md text-base text-gray-100 rounded-full h-10 px-4 py-6 flex items-center gap-2 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95 ring-1 ring-white/10"
            aria-label="Replay video"
            tabIndex={0}>
            <ReplayIcon />
          </button>
        )}
      </div>

      {/* TV show details */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black via-black/60 to-transparent pt-[25%] p-4 md:pl-20 lg:pl-20 flex flex-col gap-8 pb-10">
        <BackHomeBtn />
        {/* Poster image: Show on mobile, or when video is not playing/unavailable */}
        {(videosLoading || !videoUrl || !showVideo) && data?.poster_path && (
          <div className="hidden md:flex relative md:static group">
            <img
              src={
                data?.poster_path
                  ? `https://image.tmdb.org/t/p/w500/${data?.poster_path}`
                  : FALLBACK_POSTER
              }
              alt={data?.name || "TV Show Poster"}
              className="w-[250px] object-cover rounded-2xl relative left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:translate-none md:static transition-transform duration-300 ease-in-out group-hover:scale-110 group-hover:rotate-2"
            />
          </div>
        )}

        {/* Poster image: Show on mobile by default */}
        {data?.poster_path && (
          <div className="md:hidden relative md:static group">
            <img
              src={
                data?.poster_path
                  ? `https://image.tmdb.org/t/p/w500/${data?.poster_path}`
                  : FALLBACK_POSTER
              }
              alt={data?.name || "TV Show Poster"}
              className="w-[250px] object-cover rounded-2xl relative left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:translate-none md:static transition-transform duration-300 ease-in-out group-hover:scale-110 group-hover:rotate-2"
            />
          </div>
        )}

        {/* Logo */}
        <TvLogoDisplay
          isVideoPlaying={showVideo}
          logosLoading={logosLoading}
          logosError={!!logosError}
          selectedLogo={selectedLogo}
          title={data?.name}
        />

        {/* Tagline */}
        {data?.tagline && (
          <p className="text-white text-lg w-full md:w-1/2 lg:w-1/3">
            {data?.tagline}
          </p>
        )}

        {/* Website, bookmark, metadata */}
        <section className="flex gap-2 flex-wrap">
          {data?.first_air_date && (
            <span className="text-md roboto-condensed-light capitalize backdrop-blur-md text-base text-gray-100 rounded-full h-10 px-4 py-6 flex items-center gap-2 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95 ring-1 ring-white/10">
              {new Date(data.first_air_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          )}
          {data?.vote_average && (
            <p className="text-md roboto-condensed-light capitalize backdrop-blur-md text-base text-gray-100 rounded-full h-10 px-4 py-6 flex items-center gap-2 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95 ring-1 ring-white/10">
              <StarIcon />
              <span className="font-bold">
                {data?.vote_average.toFixed(1)}/10
              </span>
            </p>
          )}
          {data?.number_of_seasons && (
            <p className="text-md roboto-condensed-light capitalize backdrop-blur-md text-base text-gray-100 rounded-full h-10 px-4 py-6 flex items-center gap-2 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95 ring-1 ring-white/10">
              Seasons:{" "}
              <span className="font-bold">{data?.number_of_seasons}</span>
            </p>
          )}
          {data?.status && (
            <p className="text-md roboto-condensed-light capitalize backdrop-blur-md text-base text-gray-100 rounded-full h-10 px-4 py-6 flex items-center gap-2 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95 ring-1 ring-white/10">
              Status: <span className="font-bold">{data?.status}</span>
            </p>
          )}
          {data?.homepage && (
            <a
              href={data?.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="text-md roboto-condensed-light capitalize backdrop-blur-md text-base text-gray-100 rounded-full h-10 px-4 py-6 flex items-center gap-2 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95 ring-1 ring-white/10"
              aria-label="Visit TV show website">
              <WebsiteIcon />
              <span className="text-md roboto-condensed-light capitalize">
                website
              </span>
            </a>
          )}
          <TvBookmarkBtn
            user={user}
            id={data?.id ? data?.id.toString() : ""}
            data={{
              poster_path: data?.poster_path ?? "",
              vote_average: data?.vote_average ?? 0,
              release_date: data?.first_air_date ?? "",
            }}
            isBookmarked={!!isBookmarked}
            category="tv"
      
          />
          {videoUrl && (
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-md roboto-condensed-light capitalize backdrop-blur-md text-base text-gray-100 rounded-full h-10 px-4 py-6 flex items-center gap-2 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95 ring-1 ring-white/10">
              <YouTubeIcon />
              YouTube
            </a>
          )}
        </section>

        {/* Description */}
        {data?.overview && (
          <p className="text-white text-lg roboto-condensed-light w-full md:w-1/2 lg:w-1/2 backdrop-blur-sm rounded px-4 py-6 transition duration-300 ease-in-out transform">
            <span className="font-bold">Description: </span> {data?.overview}
          </p>
        )}

        {data?.spoken_languages && (
          <InfoTvSection
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
          <InfoTvSection
            title="Genre"
            items={data?.genres?.map(({ name, id }) => ({ id, name }))}
            typeKey="with_genres"
           
          />
        )}

        {data?.production_companies && (
          <InfoTvSection
            title="Production Companies"
            items={data?.production_companies?.map(({ name, id }) => ({
              id,
              name,
            }))}
            typeKey="with_companies"
           
          />
        )}

        {data?.production_countries && (
          <InfoTvSection
            title="Production Countries"
            items={data?.production_countries?.map(({ name, iso_3166_1 }) => ({
              id: iso_3166_1,
              name,
            }))}
            typeKey="with_origin_country"
           
          />
        )}

        {/* Created by section */}
        {data?.created_by?.length > 0 && (
          <section className="flex items-center gap-2 flex-wrap">
            <span
              className="text-md roboto-condensed-light capitalize backdrop-blur-md text-base text-gray-100 rounded-full h-10 px-4 py-6 flex items-center gap-2 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95 ring-1 ring-white/10"
              aria-label="Created By">
              <CreatorIcon />
              <span className="text-md roboto-condensed-light capitalize">
                created by
              </span>
            </span>
            |
            {data?.created_by?.map(({ name, id }) => (
              <Link
                key={id}
                to="/people/$personId"
                params={{ personId: id.toString() }}
                aria-label={`View details for ${name}`}
                className="text-[#FACC15] hover:underline">
                {name}
              </Link>
            ))}
          </section>
        )}
        <br />

        {/* Seasons section */}
        {data?.seasons && <SeasonsSection seasons={data?.seasons} />}

        {/* Cast section */}
        {(credits?.cast ?? []).length > 0 && (
          <Credits creditsLoading={creditsLoading}>
            {(credits?.cast ?? []).map((cast) => (
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
        )}

        {/* Recommendations section */}
        <h1 className="text-3xl max-sm:text-2xl lg:text-4xl font-medium tracking-tight">
          Recommendations
        </h1>
        <section className="w-full min-h-1/2 md:p-4 flex flex-wrap items-start justify-center gap-2 md:gap-10 pb-10">
          {recommendations?.results?.length === 0 && (
            <p>No recommendations available</p>
          )}
          {recommendationsLoading && <Loading />}
          {recommendations?.results?.map(
            ({ id, name, first_air_date, poster_path, vote_average }) => (
              <MediaCard
                key={id}
                id={id}
                title={name}
                release_date={first_air_date}
                poster_path={poster_path}
                vote_average={vote_average}
                type="tv"
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

export default TVDetails;
