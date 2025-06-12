import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getPersonDetails, getPersonCredits } from "@/api/people";
import BackHomeBtn from "@/components/BackHomeBtn";
import MediaCard from "@/components/MediaCard";
import Loading from "@/components/Loading";
import Footer from "@/components/Footer";

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
      <p
        key={index}
        className="mb-4 text-gray-100 text-md ">
        {para}
      </p>
    ));
  };

  return (
    <div className="relative w-full min-h-screen bg-black">
      {/* Background Profile Image (Commented Out) */}
      {/* {person?.profile_path && (
        <img
          alt={person?.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover fixed opacity-20 block lg:hidden"
          src={`https://image.tmdb.org/t/p/original/${person?.profile_path}`}
        />
      )} */}

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col gap-8">
        <BackHomeBtn />
        <title>Trailer Base - Person Details</title>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Image */}
          <div className="flex-shrink-0 mx-auto md:mx-0 group">
            <img
              src={
                person?.profile_path
                  ? `https://image.tmdb.org/t/p/w500/${person?.profile_path}`
                  : FALLBACK_POSTER
              }
              alt={person?.name || "Profile Image"}
              className="w-64 h-auto rounded-2xl md:rounded-lg shadow-lg transition-transform duration-300 ease-in-out group-hover:scale-110 group-hover:rotate-2"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col gap-6">
            <h1 className="text-3xl max-sm:text-2xl lg:text-4xl font-medium tracking-tight">
              {person?.name}
            </h1>

            {/* Metadata */}
            <div className="flex flex-wrap gap-3">
              {person?.homepage && (
                <a
                  href={person?.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-style"
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
                <span className="button-style">
                  <span className="font-semibold">Born:</span>
                  {new Date(person?.birthday).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              )}
              {person?.gender && (
                <span className="button-style">
                  <span className="font-semibold">Gender:</span>
                  {person?.gender === 1 ? "Female" : "Male"}
                </span>
              )}
              {person?.popularity && (
                <span className="button-style">
                  <span className="font-semibold">Popularity:</span>
                  {person?.popularity.toFixed(2)}%
                </span>
              )}
              {person?.place_of_birth && (
                <span className="button-style">
                  <span className="font-semibold">Born in:</span>
                  {person?.place_of_birth}
                </span>
              )}
              {person?.deathday && (
                <span className="text-md  capitalize backdrop-blur-md text-base text-gray-100 rounded-full h-10 py-4 flex items-center gap-2 hover:grayscale-50 transition duration-200 ease-in-out transform hover:scale-95 ring-1 ring-white/10">
                  <span className="font-semibold">Died:</span>
                  {new Date(person?.deathday).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>

            {/* Biography */}
            <div className=" backdrop-blur-md text-white p-6 rounded-lg shadow-lg ring-1 ring-white/10 max-w-3xl mx-auto transition-all duration-300 hover:shadow-xl">
              <h2 className="text-xl font-semibold mb-4 text-white ">
                Biography
              </h2>
              {person?.biography ? (
                formatBiography(person?.biography)
              ) : (
                <p className="text-gray-100 text-md ">
                  No biography available.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Movie Credits */}
        {movieCastCredits.length > 0 && (
          <section className="mt-6">
            <h3 className="text-3xl max-sm:text-2xl lg:text-4xl font-medium tracking-tight ">
              Movies
            </h3>
            <div className="w-full min-h-1/2 md:p-4 flex flex-wrap items-start justify-center gap-2 md:gap-10 pb-10">
              {movieCastCredits.map((credit: any) => (
                <div key={credit?.credit_id}>
                  <MediaCard
                    id={credit?.id}
                    title={credit?.title}
                    release_date={credit?.release_date || "N/A"}
                    poster_path={credit?.poster_path}
                    vote_average={credit?.vote_average}
                    type="movie"
                  />
                </div>
              ))}
            </div>
          </section>
        )}
        {movieCastCredits.length === 0 && (
          <p className="text-white text-md  mt-4">
            No movie cast credits available.
          </p>
        )}

        {/* TV Credits */}
        {tvCastCredits.length > 0 && (
          <section className="mt-6">
            <h3 className="text-3xl max-sm:text-2xl lg:text-4xl font-medium tracking-tight">
              TV Shows
            </h3>
            <div className="w-full min-h-1/2 md:p-4 flex flex-wrap items-start justify-center gap-2 md:gap-10 pb-10">
              {tvCastCredits.map((credit: any) => (
                <div key={credit?.credit_id}>
                  <MediaCard
                    id={credit?.id}
                    title={credit?.name || credit?.title}
                    release_date={credit?.first_air_date || "N/A"}
                    poster_path={credit?.poster_path}
                    vote_average={credit?.vote_average}
                    type="tv"
                  />
                </div>
              ))}
            </div>
          </section>
        )}
        {tvCastCredits.length === 0 && (
          <p className="text-white text-md  mt-4">
            No TV show cast credits available.
          </p>
        )}
      </div>

      <Footer/>
    </div>
  );
}

export default PersonDetailsPage;
