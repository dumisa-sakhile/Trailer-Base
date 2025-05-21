import { createFileRoute } from "@tanstack/react-router";
import TypeLink from "@/components/TypeLink";
import BackHomeBtn from "@/components/BackHomeBtn";
import { useQuery } from "@tanstack/react-query";
import { getMovieDetails, getMovieVideos } from "@/api/movie";
import Loading from "@/components/Loading";
import Modal from "@/components/Modal";
import { useState } from "react";


export const Route = createFileRoute("/movie/$movieId")({
  loader: async ({ params }) => {
    return { movieId: params.movieId };
  },
  component: MovieDetails,
});



function MovieDetails() {
  const { movieId } = Route.useLoaderData();

  const { data, isLoading } = useQuery({
    queryKey: ["movie", movieId],
    queryFn: () => getMovieDetails(movieId),
  });

  const { data: videos } = useQuery({
    queryKey: ["movie-videos", movieId],
    queryFn: () => getMovieVideos(movieId),
  })

  
  

  // Format runtime (e.g., 125 minutes -> "2h 5m")
  const formatRuntime = (minutes?: number) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours ? `${hours}h ` : ""}${mins ? `${mins}m` : ""}`.trim();
  };

  const [modalOpen, setModalOpen] = useState(false);

  // Early return for loading state
  if (isLoading || !data) {
    return <Loading />;
  }

  return (
    <>
      <div>
        <Modal
          isShowing={modalOpen}
          hide={() => setModalOpen(false)}
          videos={videos?.results || []}
        />
      </div>
      {data.backdrop_path && (
        <img
          alt={data.title || "Movie Poster"}
          loading="lazy"
          width="1920"
          height="1080"
          decoding="async"
          className="w-full h-full object-cover fixed hidden lg:block -z-0"
          src={`https://image.tmdb.org/t/p/original/${data.backdrop_path}`}
        />
      )}

      {/* Movie details */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black pt-[15%] p-4 md:pl-10 lg:pl-20 flex flex-col gap-8 pb-10">
        <BackHomeBtn />
        <div className="relative md:static">
          <img
            src={
              data.poster_path
                ? `https://image.tmdb.org/t/p/w500/${data.poster_path}`
                : `https://github.com/dumisa-sakhile/CinemaLand/blob/main/public/poster.png?raw=truehttps://raw.githubusercontent.com/dumisa-sakhile/CinemaLand/refs/heads/main/public/poster.png`
            }
            alt={data.title || "Movie Poster"}
            className="w-[250px] object-cover rounded relative left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:translate-none md:static"
          />
        </div>

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
              className="text-white text-md roboto-condensed-light capitalize bg-[rgba(39,39,39,0.5)] backdrop-blur-sm rounded-full h-10 px-4 py-6 flex items-center gap-2 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95">
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
          <button className="text-white text-md roboto-condensed-light capitalize bg-[rgba(39,39,39,0.5)] backdrop-blur-sm rounded h-10 px-4 py-6 flex items-center gap-2 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95">
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
                d="m17 21-5-4-5 4V3.889a.92.92 0 0 1 .244-.629.808.808 0 0 1 .59-.26h8.333a.81.81 0 0 1 .589.26.92.92 0 0 1 .244.63V21Z"
              />
            </svg>
            <span className="text-md roboto-condensed-light capitalize">
              bookmark
            </span>
          </button>

          {/* Videos collection */}
          <button
            className="text-white text-md roboto-condensed-light capitalize bg-[rgba(39,39,39,0.5)] backdrop-blur-sm rounded h-10 px-4 py-6 flex items-center gap-2 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95"
            onClick={() => setModalOpen(true)}>
            <svg
              className="w-6 h-6 text-white" // Fixed typo: tex-white -> text-white
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
        <article className="flex items-center  flex-wrap gap-4 geist-regular text-lg">
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
          <p className="text-white text-md roboto-condensed-regular w-full md:w-1/2 lg:w-1/2 bg-[rgba(0,0,0,0.2)] backdrop-blur-sm rounded px-4 py-6 rounded-lg ring-1 ring-gray-900/50 hover:ring-gray-900/50 transition duration-300 ease-in-out transform">
            <span className="font-bold">Description: </span> {data.overview}
          </p>
        )}

        {/* Languages section */}
        {data.spoken_languages?.length > 0 && (
          <section className="flex items-center gap-2 flex-wrap">
            <button className="text-white text-md roboto-condensed-light capitalize bg-[rgba(39,39,39,0.5)] backdrop-blur-sm rounded h-10 px-4 py-6 flex items-center gap-2 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95">
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
            {data.spoken_languages.map(
              ({
                english_name,
                iso_639_1,
              }: {
                english_name: string;
                iso_639_1: string;
              }) => (
                <TypeLink
                  key={iso_639_1}
                  type="with_original_language"
                  typeName={english_name}
                  typeId={iso_639_1}
                  page={1}
                  // Add title context
                />
              )
            )}
          </section>
        )}

        {/* Genre section */}
        {data.genres?.length > 0 && (
          <section className="flex items-center gap-2 flex-wrap">
            <button className="text-white text-md roboto-condensed-light capitalize bg-[rgba(39,39,39,0.5)] backdrop-blur-sm rounded h-10 px-4 py-6 flex items-center gap-2 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95">
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
            {data.genres.map(({ name, id }: { name: string; id: number }) => (
              <TypeLink
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
        {data.production_companies?.length > 0 && (
          <section className="flex items-center gap-2 flex-wrap">
            <button className="text-white text-md roboto-condensed-light capitalize bg-[rgba(39,39,39,0.5)] backdrop-blur-sm rounded h-10 px-4 py-6 flex items-center gap-2 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95">
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
            {data.production_companies.map(
              ({ name, id }: { name: string; id: number }) => (
                <TypeLink
                  key={id}
                  type="with_companies"
                  typeName={name}
                  typeId={id.toString()}
                  page={1}
                />
              )
            )}
          </section>
        )}

        {/* Production countries section */}
        {data.production_countries?.length > 0 && (
          <section className="flex items-center gap-2 flex-wrap">
            <button className="text-white text-md roboto-condensed-light capitalize bg-[rgba(39,39,39,0.5)] backdrop-blur-sm rounded h-10 px-4 py-6 flex items-center gap-2 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95">
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
            {data.production_countries.map(
              ({ name, iso_3166_1 }: { name: string; iso_3166_1: string }) => (
                <TypeLink
                  key={iso_3166_1}
                  type="with_origin_country"
                  typeName={name}
                  typeId={iso_3166_1}
                  page={1}
                />
              )
            )}
          </section>
        )}

        <br />
        <br />
        <br />
        <br />
      </div>
    </>
  );
}
