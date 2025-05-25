import { createFileRoute, Link } from "@tanstack/react-router";
import TvTypeLink from "@/components/TvTypeLink";
import BackHomeBtn from "@/components/BackHomeBtn";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTVDetails,
  getTVVideos,
  getTVCredits,
  getTVRecommendations,
} from "@/api/tv";
import Loading from "@/components/Loading";
import Modal from "@/components/Modal";
import { useState, useEffect, useRef } from "react";
import { auth, db } from "@/config/firebase";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "sonner";
import CastCard from "@/components/CastCard";
import MediaCard from "@/components/MediaCard";
import Credits from "@/components/Credit";

// Interfaces for type safety
interface CreatedBy {
  id: number;
  credit_id: string;
  name: string;
  original_name: string;
  gender: number;
  profile_path?: string | null;
}

interface Season {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path?: string | null;
  season_number: number;
  vote_average: number;
}

interface LastEpisode {
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
  still_path?: string | null;
}

interface TVDetails {
  id: number;
  name: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average: number;
  first_air_date: string;
  episode_run_time?: number[];
  tagline?: string;
  overview?: string;
  homepage?: string;
  spoken_languages: { english_name: string; iso_639_1: string; name: string }[];
  genres: { id: number; name: string }[];
  production_companies: {
    id: number;
    logo_path?: string | null;
    name: string;
    origin_country: string;
  }[];
  production_countries: { iso_3166_1: string; name: string }[];
  created_by: CreatedBy[];
  number_of_episodes: number;
  number_of_seasons: number;
  last_air_date?: string;
  last_episode_to_air?: LastEpisode | null;
  seasons: Season[];
  status: string;
  type: string;
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

interface TVProps {
  id: number;
  name: string;
  first_air_date: string;
  poster_path: string | null;
  vote_average: number;
}

export const Route = createFileRoute("/tv/$tvId")({
  loader: async ({ params }) => {
    return { tvId: params.tvId };
  },
  component: TVDetails,
});

const FALLBACK_POSTER =
  "https://raw.githubusercontent.com/dumisa-sakhile/CinemaLand/main/public/poster.png";

function TVDetails() {
  const { tvId } = Route.useLoaderData();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<import("firebase/auth").User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

   const scrollRef = useRef<HTMLDivElement>(null);
  
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

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      if (!data) throw new Error("TV data not available");
      const bookmarkRef = doc(db, "users", user?.uid, "bookmarks", tvId);

      if (isBookmarked) {
        await deleteDoc(bookmarkRef);
      } else {
        await setDoc(bookmarkRef, {
          id: data?.id,
          title: data?.name, // Use 'name' as 'title' for bookmark
          poster_path: data?.poster_path,
          vote_average: data?.vote_average,
          release_date: data?.first_air_date,
          category: "tv",
          addedAt: new Date().toISOString(),
        });
      }
    },
    onSuccess: () => {
      toast.success(isBookmarked ? "Bookmark removed!" : "Bookmark added!");
      queryClient.invalidateQueries({
        queryKey: ["bookmarks", tvId, user?.uid],
      });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleBookmark = () => {
    if (!user) {
      toast.error("Please login to bookmark TV shows");
      return;
    }
    bookmarkMutation.mutate();
  };


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
      {data?.backdrop_path && (
        <img
          alt={data?.name || "TV Show Poster"}
          loading="lazy"
          width="1920"
          height="1080"
          decoding="async"
          className="w-full h-full object-cover fixed hidden lg:block -z-0"
          src={`https://image.tmdb.org/t/p/original/${data?.backdrop_path}`}
        />
      )}

      {/* TV show details */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black pt-[15%] p-4 md:pl-10 lg:pl-20 flex flex-col gap-8 pb-10">
        <BackHomeBtn />
        <div className="relative md:static">
          <img
            src={
              data?.poster_path
                ? `https://image.tmdb.org/t/p/w500/${data?.poster_path}`
                : FALLBACK_POSTER
            }
            alt={data?.name || "TV Show Poster"}
            className="w-[250px] object-cover rounded relative left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:translate-none md:static"
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
              className="text-white text-md roboto-condensed-light capitalize bg-[rgba(39,39,39,0.5)] backdrop-blur-sm rounded-full h-10 px-4 py-6 flex items-center gap-2 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95"
              aria-label="Visit TV show website">
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
            className="text-white text-md roboto-condensed-light capitalize bg-[rgba(39,39,39,0.5)] backdrop-blur-sm rounded h-10 px-4 py-6 flex items-center gap-2 hover:gr grayscale-50 transition duration-300 ease-in-out transform hover:scale-95"
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

        {/* First air date, rating, seasons, status */}
        <article className="flex items-center flex-wrap gap-4 geist-regular text-lg">
          {data?.first_air_date && (
            <p className="flex items-center gap-2">
              First Aired:{" "}
              <span className="text-[#FACC15]">{data?.first_air_date}</span>
            </p>
          )}
          {data?.vote_average && (
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
                {data?.vote_average.toFixed(1)}/10
              </span>
            </p>
          )}
          {data?.number_of_seasons && (
            <p className="flex items-center gap-2">
              Seasons:{" "}
              <span className="text-[#FACC15]">{data?.number_of_seasons}</span>
            </p>
          )}
          {data?.status && (
            <p className="flex items-center gap-2">
              Status: <span className="text-[#FACC15]">{data?.status}</span>
            </p>
          )}
        </article>

        {/* Description */}
        {data?.overview && (
          <p className="text-white text-md roboto-condensed-regular w-full md:w-1/2 lg:w-1/2 bg-[rgba(0,0,0,0.2)] backdrop-blur-sm rounded px-4 py-6 ring-1 ring-gray-900/50 hover:ring-gray-900/50 transition duration-300 ease-in-out transform">
            <span className="font-bold">Description: </span> {data?.overview}
          </p>
        )}

        {/* Languages section */}
        {data?.spoken_languages?.length > 0 && (
          <section className="flex items-center gap-2 flex-wrap">
            <button
              className="text-white text-md roboto-condensed-light capitalize bg-[rgba(39,39,39,0.5)] backdrop-blur-sm rounded h-10 px-4 py-6 flex items-center gap-2 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95"
              aria-label="Languages">
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
                  strokeWidth="1.5"
                  d="m13 19 3.5-9 3.5 9m-6.125-2h5.25M3 7h7m0 0h2m-2 0c0 1.63-.793 3.926-2.239 5.655M7.5 6.818V5m.261 7.655C6.79 13.82 5.521 14.725 4 15m3.761-2.345L5 10m2.761 2.655L10.2 15"
                />
              </svg>
              <span className="text-md roboto-condensed-light capitalize">
                Languages
              </span>
            </button>{" "}
            |{" "}
            {data?.spoken_languages?.map(({ english_name, iso_639_1 }) => (
              <TvTypeLink
                key={iso_639_1}
                type="with_original_language"
                typeName={english_name}
                typeId={iso_639_1}
                page={1}
              />
            ))}
          </section>
        )}

        {/* Genre section */}
        {data?.genres?.length > 0 && (
          <section className="flex items-center gap-2 flex-wrap">
            <button
              className="text-white text-md roboto-condensed-light capitalize bg-[rgba(39,39,39,0.5)] backdrop-blur-sm rounded h-10 px-4 py-6 flex items-center gap-2 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95"
              aria-label="Genres">
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
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M7.58209 8.96025 9.8136 11.1917l-1.61782 1.6178c-1.08305-.1811-2.23623.1454-3.07364.9828-1.1208 1.1208-1.32697 2.8069-.62368 4.1363.14842.2806.42122.474.73509.5213.06726.0101.1347.0133.20136.0098-.00351.0666-.00036.1341.00977.2013.04724.3139.24069.5867.52125.7351 1.32944.7033 3.01552.4971 4.13627-.6237.8375-.8374 1.1639-1.9906.9829-3.0736l4.8107-4.8108c1.0831.1811 2.2363-.1454 3.0737-.9828 1.1208-1.1208 1.3269-2.80688.6237-4.13632-.1485-.28056-.4213-.474-.7351-.52125-.0673-.01012-.1347-.01327-.2014-.00977.0035-.06666.0004-.13409-.0098-.20136-.0472-.31386-.2406-.58666-.5212-.73508-1.3294-.70329-3.0155-.49713-4.1363.62367-.8374.83741-1.1639 1.9906-.9828 3.07365l-1.7788 1.77875-2.23152-2.23148-1.41419 1.41424Zm1.31056-3.1394c-.04235-.32684-.24303-.61183-.53647-.76186l-1.98183-1.0133c-.38619-.19746-.85564-.12345-1.16234.18326l-.86321.8632c-.3067.3067-.38072.77616-.18326 1.16235l1.0133 1.98182c.15004.29345.43503.49412.76187.53647l1.1127.14418c.3076.03985.61628-.06528.8356-.28461l.86321-.8632c.21932-.21932.32446-.52801.2846-.83561l-.14417-1.1127ZM19.4448 16.4052l-3.1186-3.1187c-.7811-.781-2.0474-.781-2.8285 0l-.1719.172c-.7811.781-.7811 2.0474 0 2.8284l3.1186 3.1187c.7811.781 2.0474.781 2.8285 0l.1719-.172c.7811-.781.7811-2.0474 0-2.8284Z"
                />
              </svg>
              <span className="text-md roboto-condensed-light capitalize">
                genre
              </span>
            </button>{" "}
            |{" "}
            {data?.genres?.map(({ name, id }) => (
              <TvTypeLink
                key={id}
                type="with_genres"
                typeName={name}
                typeId={id.toString()}
                page={1}
              />
            ))}
          </section>
        )}

        {/* Production companies section */}
        {data?.production_companies?.length > 0 && (
          <section className="flex items-center gap-2 flex-wrap">
            <button
              className="text-white text-md roboto-condensed-light capitalize bg-[rgba(39,39,39,0.5)] backdrop-blur-sm rounded h-10 px-4 py-6 flex items-center gap-2 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95"
              aria-label="Production Companies">
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
                  strokeWidth="1.5"
                  d="M8.5 11.5 11 14l4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <span className="text-md roboto-condensed-light capitalize">
                production companies
              </span>
            </button>{" "}
            |{" "}
            {data?.production_companies?.map(({ name, id }) => (
              <TvTypeLink
                key={id}
                type="with_companies"
                typeName={name}
                typeId={id.toString()}
                page={1}
              />
            ))}
          </section>
        )}

        {/* Production countries section */}
        {data?.production_countries?.length > 0 && (
          <section className="flex items-center gap-2 flex-wrap">
            <button
              className="text-white text-md roboto-condensed-light capitalize bg-[rgba(39,39,39,0.5)] backdrop-blur-sm rounded h-10 px-4 py-6 flex items-center gap-2 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95"
              aria-label="Production Countries">
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
                  strokeWidth="1.5"
                  d="M4.37 7.657c2.063.528 2.396 2.806 3.202 3.87 1.07 1.413 2.075 1.228 3.192 2.644 1.805 2.289 1.312 5.705 1.312 6.705M20 15h-1a4 4 0 0 0-4 4v1M8.587 3.992c0 .822.112 1.886 1.515 2.58 1.402.693 2.918.351 2.918 2.334 0 .276 0 2.008 1.972 2.008 2.026.031 2.026-1.678 2.026-2.008 0-.65.527-.9 1.177-.9H20M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <span className="text-md roboto-condensed-light capitalize">
                production countries
              </span>
            </button>{" "}
            |{" "}
            {data?.production_countries?.map(({ iso_3166_1, name }) => (
              <TvTypeLink
                key={iso_3166_1}
                type="with_origin_country"
                typeName={name}
                typeId={iso_3166_1}
                page={1}
              />
            ))}
          </section>
        )}

        {/* Created by section */}
        {data?.production_countries?.length > 0 && (
          <section className="flex items-center gap-2 flex-wrap">
            <button
              className="text-white text-md roboto-condensed-light capitalize bg-[rgba(39,39,39,0.5)] backdrop-blur-sm rounded h-10 px-4 py-6 flex items-center gap-2 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95"
              aria-label="Created By">
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
                  strokeWidth="1.5"
                  d="M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm-7 4h14v2H5v-2Z"
                />
              </svg>
              <span className="text-md roboto-condensed-light capitalize">
                created by
              </span>
            </button>{" "}
            |{" "}
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
        {data?.seasons?.length > 0 && (
          <section className="flex flex-col gap-8 relative">
            <h2 className="text-2xl lg:text-5xl md:text-3xl text-white geist-bold">
              Seasons
            </h2>
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-[#131313] hover:bg-[#333] p-2">
              <svg
                className="w-6 h-6 text-gray-800 dark:text-white"
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
                  strokeWidth="2"
                  d="m15 19-7-7 7-7"
                />
              </svg>
            </button>
            <div className="w-full overflow-x-scroll">
              <div ref={scrollRef} className="flex gap-12 p-6">
                {data?.seasons?.map((season) => (
                  <div
                    key={season?.id}
                    className="flex-none w-[300px] h-[450px] rounded-lg shadow-md relative group hover:scale-95 hover:ring-1 hover:ring-gray-400 hover:rotate-3 transition-transform duration-300 ease-in-out overflow-hidden geist-light">
                    <img
                      src={
                        season?.poster_path
                          ? `https://image.tmdb.org/t/p/w500/${season?.poster_path}`
                          : FALLBACK_POSTER
                      }
                      alt={season?.name || "Season Poster"}
                      className="w-full h-full object-cover rounded-lg"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent flex flex-col justify-end p-6 rounded-lg gap-2">
                      <h3 className="text-white text-xl roboto-condensed-bold truncate">
                        {season?.name}
                      </h3>
                      <p className="text-white text-base roboto-condensed-regular">
                        Episodes: {season?.episode_count}
                      </p>
                      <p className="text-gray-300 text-base roboto-condensed-regular">
                        Air Date: {season?.air_date || "N/A"}
                      </p>
                      <p className="text-white text-base roboto-condensed-regular flex items-center gap-1">
                        <svg
                          aria-hidden="true"
                          className="w-5 h-5"
                          style={{ color: "#ffffff" }}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 576 512">
                          <path
                            fill="currentColor"
                            d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"
                          />
                        </svg>
                        {season?.vote_average
                          ? season?.vote_average.toFixed(1)
                          : "N/A"}
                        /10
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-[#131313] hover:bg-[#333] p-2">
              <svg
                className="w-6 h-6 text-gray-800 dark:text-white"
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
                  strokeWidth="2"
                  d="m9 5 7 7-7 7"
                />
              </svg>
            </button>
          </section>
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
        <section className="w-full min-h-1/2 p-4 flex flex-wrap items-start justify-center gap-10">
          {recommendations?.results?.length === 0 && (
            <p>No recommendations available</p>
          )}
          {recommendationsLoading && <Loading />}
          {recommendations?.results?.map(
            ({ id, name, first_air_date, poster_path, vote_average }) => (
              <MediaCard
                key={id}
                id={id}
                title={name} // Map 'name' to 'title' for MediaCard
                release_date={first_air_date} // Map 'first_air_date' to 'release_date'
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
