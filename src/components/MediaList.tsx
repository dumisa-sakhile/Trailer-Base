import React from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import MediaCard from "./MediaCard"; // Adjust import path as needed
import Loading from "@/components/Loading"; // Adjust import path as needed

interface MediaProps {
  id: number;
  title?: string; // Optional for movies
  name?: string; // Optional for TV
  release_date?: string; // Optional for movies
  first_air_date?: string; // Optional for TV
  poster_path: string;
  vote_average: number;
}

interface MediaListProps {
  mediaType: "movie" | "tv";
  title: string;
  data: { results: MediaProps[] } | undefined;
  isLoading: boolean;
  isError: boolean;
  error: { message?: string } | null;
  list: "upcoming" | "top_rated" | "popular";
}

const MediaList: React.FC<MediaListProps> = ({
  mediaType,
  title,
  data,
  isLoading,
  isError,
  error,
  list,
}) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="w-full flex flex-col items-center justify-center gap-4 px-4 sm:px-6 lg:px-8 py-6">
      <div className="w-full flex items-center justify-between">
        <h2 className="text-2xl max-sm:text-xl lg:text-4xl text-gray-100 font-medium capitalize tracking-tight">
          {title}
        </h2>
        <Link
          to={`/${mediaType}/list/$list`}
          params={{ list: list }}
          search={{ page: 1 }}>
          <button className="px-3 py-2 text-xs md:text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            View All {title}
          </button>
        </Link>
      </div>
      <div className="h-4" /> {/* Spacer div */}
      {isLoading && (
        <div className="w-full text-center py-8">
          <Loading />
        </div>
      )}
      {isError && (
        <div className="w-full text-center text-red-400 font-medium py-8">
          Error: {error?.message ?? "An error occurred while fetching data."}
        </div>
      )}
      {!isLoading && !isError && data?.results && data.results.length > 0 && (
        <motion.div
          className="w-full flex flex-wrap justify-center sm:justify-start gap-4 lg:gap-6" // Use flex-wrap and justify-center/start
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.08 } }, // Slightly reduced stagger for more items
          }}>
          {data.results.map((item: MediaProps) => (
            <motion.div
              key={item.id}
              variants={cardVariants}
              className="flex-shrink-0" // Prevents cards from shrinking
            >
              <MediaCard
                id={item.id}
                title={item.title || item.name || "Untitled"}
                release_date={item.release_date || item.first_air_date || ""}
                poster_path={item.poster_path}
                vote_average={item.vote_average}
                type={mediaType}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
      {!isLoading &&
        !isError &&
        (!data?.results || data.results.length === 0) && (
          <div className="w-full text-center text-gray-400 py-8">
            No {mediaType === "movie" ? "movies" : "TV shows"} found for this
            list.
          </div>
        )}
    </section>
  );
};

export default MediaList;
