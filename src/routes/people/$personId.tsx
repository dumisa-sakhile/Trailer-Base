import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getPersonDetails, getPersonCredits } from "@/api/people";
import BackHomeBtn from "@/components/BackHomeBtn";
import MediaCard from "@/components/MediaCard";
import Loading from "@/components/Loading";
import { useRef } from "react";

export const Route = createFileRoute("/people/$personId")({
  loader: async ({ params }) => {
    return { personId: params.personId };
  },
  component: PersonDetailsPage,
});

function PersonDetailsPage() {
  const { personId } = Route.useLoaderData();

  // Fetch person details
  const {
    data: person,
    isLoading: isPersonLoading,
    error: personError,
  } = useQuery({
    queryKey: ["personDetails", personId],
    queryFn: () => getPersonDetails(personId),
  });

  const FALLBACK_POSTER =
    "https://raw.githubusercontent.com/dumisa-sakhile/CinemaLand/main/public/poster.png";

  // Fetch combined credits
  const {
    data: credits,
    isLoading: isCreditsLoading,
    error: creditsError,
  } = useQuery({
    queryKey: ["personCombinedCredits", personId],
    queryFn: () => getPersonCredits(personId),
  });

  // Separate and sort movie and TV cast credits
  const movieCastCredits =
    credits?.cast
      ?.filter((credit: any) => credit.media_type === "movie")
      .sort(
        (a: any, b: any) =>
          new Date(b.release_date).getTime() -
          new Date(a.release_date).getTime()
      ) || [];
  const tvCastCredits =
    credits?.cast
      ?.filter((credit: any) => credit.media_type === "tv")
      .sort(
        (a: any, b: any) =>
          new Date(b.first_air_date).getTime() -
          new Date(a.first_air_date).getTime()
      ) || [];

  // Carousel refs
  const movieCastRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;
  const tvCastRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;

  // Carousel scroll handler
  const scrollCarousel = (
    ref: React.RefObject<HTMLDivElement>,
    dir: "left" | "right"
  ) => {
    if (ref.current) {
      const scrollAmount = 300; // Matches MediaCard width
      ref.current.scrollBy({
        left: dir === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isPersonLoading || isCreditsLoading) {
    return <Loading />;
  }

  if (personError || creditsError) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white">
        Error loading data: {(personError || creditsError)?.message}
      </div>
    );
  }

  if (!person) {
    return (
      <div className="text-white text-center mt-10">
        No person data available
      </div>
    );
  }

  // Function to format biography text with line breaks
  const formatBiography = (biography: string) => {
    const paragraphs = biography?.split("\n");
    return paragraphs.map((para, index) => (
      <p key={index} className="mb-4">
        {para}
      </p>
    ));
  };

  return (
    <div className="relative w-full min-h-screen bg-black">
      {/* Background Profile Image */}
      {person?.poster_path && (
        <img
          alt={person?.name || "TV Show Poster"}
          loading="lazy"
          width="1920"
          height="1080"
          decoding="async"
          className="w-full h-full object-cover fixed block lg:hidden -z-0"
          src={`https://image.tmdb.org/t/p/original/${person?.poster_path}`}
        />
      )}

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col gap-8">
        <BackHomeBtn />
        <title>Trailer Base - Person Details</title>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Image */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <img
              src={
                person?.profile_path
                  ? `https://image.tmdb.org/t/p/w500/${person?.profile_path}`
                  : FALLBACK_POSTER
              }
              alt={person?.name || "Profile Image"}
              className="w-64 h-auto rounded-lg shadow-lg filter "
            />
          </div>

          {/* Details */}
          <div className="flex flex-col gap-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {person?.name}
            </h1>

            {/* Metadata */}
            <div className="flex flex-wrap gap-3">
              {person?.homepage && (
                <a
                  href={person?.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full hover:bg-white/20 transition-transform transform hover:scale-95"
                  aria-label="Visit website">
                  <svg
                    className="w-5 h-5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
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
                  <span>Website</span>
                </a>
              )}
              {person?.birthday && (
                <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full">
                  <span className="font-semibold">Born:</span>
                  {new Date(person?.birthday).toLocaleDateString()}
                </span>
              )}
              {person?.gender && (
                <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full">
                  <span className="font-semibold">Gender:</span>
                  {person?.gender === 1 ? "Female" : "Male"}
                </span>
              )}
              {person?.popularity && (
                <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full">
                  <span className="font-semibold">Popularity:</span>
                  {person?.popularity.toFixed(2)}%
                </span>
              )}
              {person?.place_of_birth && (
                <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full">
                  <span className="font-semibold">Born in:</span>
                  {person?.place_of_birth}
                </span>
              )}
              {person?.deathday && (
                <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full">
                  <span className="font-semibold">Died:</span>
                  {new Date(person?.deathday).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Biography */}
            <div className="bg-white/10 backdrop-blur-sm text-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
              <h2 className="text-xl font-semibold mb-4">Biography</h2>
              {person?.biography
                ? formatBiography(person?.biography)
                : "No biography available."}
            </div>
          </div>
        </div>

        {/* Movie Credits */}
        {movieCastCredits.length > 0 && (
          <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold text-white">
                Movie Credits
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => scrollCarousel(movieCastRef, "left")}
                  aria-label="Scroll left"
                  className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M15 19l-7-7 7-7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => scrollCarousel(movieCastRef, "right")}
                  aria-label="Scroll right"
                  className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M9 5l7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div
              ref={movieCastRef}
              className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth"
              style={{ WebkitOverflowScrolling: "touch" }}>
              {movieCastCredits?.map((credit: any) => (
                <div key={credit?.credit_id} className="snap-start">
                  <MediaCard
                    id={credit?.id}
                    title={credit?.title}
                    release_date={credit?.release_date || "N/A"}
                    poster_path={credit?.poster_path}
                    vote_average={credit?.vote_average}
                    type={credit?.media_type}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
        {movieCastCredits.length === 0 && (
          <p className="text-white text-lg">No movie cast credits available.</p>
        )}

        {/* TV Credits */}
        {tvCastCredits.length > 0 && (
          <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold text-white">TV Credits</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => scrollCarousel(tvCastRef, "left")}
                  aria-label="Scroll left"
                  className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M15 19l-7-7 7-7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => scrollCarousel(tvCastRef, "right")}
                  aria-label="Scroll right"
                  className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M9 5l7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div
              ref={tvCastRef}
              className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth"
              style={{ WebkitOverflowScrolling: "touch" }}>
              {tvCastCredits?.map((credit: any) => (
                <div key={credit?.credit_id} className="snap-start">
                  <MediaCard
                    id={credit?.id}
                    title={credit?.name || credit?.title}
                    release_date={credit?.first_air_date || "N/A"}
                    poster_path={credit?.poster_path}
                    vote_average={credit?.vote_average}
                    type={credit?.media_type}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
        {tvCastCredits?.length === 0 && (
          <p className="text-white text-lg">No TV cast credits available.</p>
        )}
      </div>
    </div>
  );
}
