import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getPersonDetails, getPersonCredits } from "@/api/people";
import BackHomeBtn from "@/components/BackHomeBtn";
import MediaCard from "@/components/MediaCard";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import Atropos from "atropos/react";
import "atropos/atropos.css";
import PersonDetailsSkeleton from "@/components/PersonDetailsSkeleton"; // Import the new skeleton component

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
    "https://img.freepik.com/premium-photo/clear-empty-photographer-studio-background-abstract-background-texture-beauty-dark-light-clear-blue-cold-gray-snowy-white-gradient-flat-wall-floor-empty-spacious-room-winter-interior_1008660-2183.jpg?semt=ais_hybrid&w=740";

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

  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  if (isPersonLoading || isCreditsLoading) {
    // Display custom skeleton while loading
    return <PersonDetailsSkeleton />;
  }

  if (personError || creditsError) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible">
          <motion.p
            variants={itemVariants}
            className="text-red-500 text-center">
            Error loading data: {(personError || creditsError)?.message}
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible">
          <motion.p variants={itemVariants} className="text-center">
            No person data available
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Function to format biography text with line breaks
  const formatBiography = (biography: string) => {
    const paragraphs = biography?.split("\n") || [];
    return paragraphs.map((para: string, index: number) => (
      <motion.p
        key={index}
        variants={itemVariants}
        className="mb-4 text-neutral-100 text-md">
        {para}
      </motion.p>
    ));
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative w-full min-h-screen bg-black">
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col gap-8">
        <motion.div variants={itemVariants}>
          <BackHomeBtn />
        </motion.div>
        <title>Trailer Base - Person Details</title>

        {/* Header Section */}
        <motion.div
          variants={containerVariants}
          className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          {" "}
          {/* Added items-center for mobile, items-start for desktop */}
          {/* Profile Image */}
          <div className="flex-shrink-0 mx-auto md:mx-0 group">
            {/* Removed Suspense as react-query handles loading */}
            <Atropos
              className="w-64 h-auto rounded-2xl overflow-hidden"
              activeOffset={30}
              shadow={false}
              highlight={false}
              rotateTouch="scroll-y"
              rotateXMax={15}
              rotateYMax={15}>
              <img
                data-atropos-offset="-5"
                src={
                  person?.profile_path
                    ? `https://image.tmdb.org/t/p/w500/${person?.profile_path}`
                    : FALLBACK_POSTER
                }
                alt={person?.name || "Profile Image"}
                className="w-64 h-auto rounded-2xl cursor-move shadow-lg transition-transform duration-300 ease-in-out group-hover:scale-110 group-hover:rotate-2"
              />
            </Atropos>
          </div>
          {/* Details */}
          <motion.div
            variants={containerVariants}
            className="flex flex-col gap-6 text-center md:text-left flex-grow">
            {" "}
            {/* Added text-center for mobile, text-left for desktop */}
            <motion.h1
              variants={itemVariants}
              className="text-3xl max-sm:text-2xl lg:text-4xl font-medium tracking-tight text-white">
              {person?.name}
            </motion.h1>
            {/* Metadata */}
            <motion.div
              variants={containerVariants}
              className="flex flex-wrap gap-3 justify-center md:justify-start">
              {" "}
              {/* Added justify-center for mobile, justify-start for desktop */}
              {person?.homepage && (
                <motion.a
                  variants={itemVariants}
                  href={person?.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 text-neutral-200 rounded-full text-sm font-medium transition-colors hover:bg-blue-600 hover:text-white ring-1 ring-neutral-700"
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
                </motion.a>
              )}
              {person?.birthday && (
                <motion.span
                  variants={itemVariants}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 text-neutral-200 rounded-full text-sm font-medium ring-1 ring-neutral-700">
                  <span className="font-semibold">Born:</span>
                  {new Date(person?.birthday).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </motion.span>
              )}
              {person?.gender !== undefined &&
                person?.gender !== null &&
                person?.gender !== 0 && (
                  <motion.span
                    variants={itemVariants}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 text-neutral-200 rounded-full text-sm font-medium ring-1 ring-neutral-700">
                    <span className="font-semibold">Gender: </span>
                    {person.gender === 1
                      ? "Female"
                      : person.gender === 2
                        ? "Male"
                        : "Other"}
                  </motion.span>
                )}
              {person?.popularity && (
                <motion.span
                  variants={itemVariants}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 text-neutral-200 rounded-full text-sm font-medium ring-1 ring-neutral-700">
                  <span className="font-semibold">Popularity:</span>
                  {person?.popularity.toFixed(2)}%
                </motion.span>
              )}
              {person?.place_of_birth && (
                <motion.span
                  variants={itemVariants}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 text-neutral-200 rounded-full text-sm font-medium ring-1 ring-neutral-700">
                  <span className="font-semibold">Born in:</span>
                  {person?.place_of_birth}
                </motion.span>
              )}
              {person?.deathday && (
                <motion.span
                  variants={itemVariants}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 text-neutral-200 rounded-full text-sm font-medium ring-1 ring-neutral-700">
                  <span className="font-semibold">Died:</span>
                  {new Date(person?.deathday).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </motion.span>
              )}
            </motion.div>
            {/* Biography */}
            <motion.div
              variants={containerVariants}
              className="backdrop-blur-md bg-neutral-900/50 text-white p-6 rounded-lg shadow-lg ring-1 ring-white/10 max-w-3xl mx-auto md:mx-0 w-full transition-all duration-300 hover:shadow-xl">
              <motion.h2
                variants={itemVariants}
                className="text-xl font-semibold mb-4 text-white">
                Biography
              </motion.h2>
              {person?.biography ? (
                formatBiography(person?.biography)
              ) : (
                <motion.p
                  variants={itemVariants}
                  className="text-neutral-100 text-md">
                  No biography available.
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Movie Credits */}
        {movieCastCredits.length > 0 && (
          <motion.section variants={containerVariants} className="mt-6">
            <motion.h3
              variants={itemVariants}
              className="text-3xl max-sm:text-2xl lg:text-4xl font-medium tracking-tight text-white mb-4">
              Movies
            </motion.h3>
            <motion.div
              variants={containerVariants}
              className="w-full flex flex-wrap justify-center gap-2 md:gap-10 pb-10">
              {movieCastCredits.map((credit: any, index: number) => (
                <motion.div
                  key={credit?.credit_id}
                  variants={itemVariants}
                  transition={{ delay: index * 0.05 }}>
                  <MediaCard
                    id={credit?.id}
                    title={credit?.title}
                    release_date={credit?.release_date || null}
                    poster_path={credit?.poster_path}
                    vote_average={credit?.vote_average}
                    type="movie"
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        )}
        {movieCastCredits.length === 0 && (
          <motion.p
            variants={itemVariants}
            className="text-neutral-300 text-md mt-4 text-center md:text-left">
            No movie cast credits available.
          </motion.p>
        )}

        {/* TV Credits */}
        {tvCastCredits.length > 0 && (
          <motion.section variants={containerVariants} className="mt-6">
            <motion.h3
              variants={itemVariants}
              className="text-3xl max-sm:text-2xl lg:text-4xl font-medium tracking-tight text-white mb-4">
              TV Shows
            </motion.h3>
            <motion.div
              variants={containerVariants}
              className="w-full flex flex-wrap justify-center gap-2 md:gap-10 pb-10">
              {tvCastCredits.map((credit: any, index: number) => (
                <motion.div
                  key={credit?.credit_id}
                  variants={itemVariants}
                  transition={{ delay: index * 0.05 }}>
                  <MediaCard
                    id={credit?.id}
                    title={credit?.name || credit?.title}
                    release_date={credit?.first_air_date || null}
                    poster_path={credit?.poster_path}
                    vote_average={credit?.vote_average}
                    type="tv"
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        )}
        {tvCastCredits.length === 0 && (
          <motion.p
            variants={itemVariants}
            className="text-neutral-300 text-md mt-4 text-center md:text-left">
            No TV show cast credits available.
          </motion.p>
        )}
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible">
        <Footer />
      </motion.div>
    </motion.div>
  );
}

export default PersonDetailsPage;
