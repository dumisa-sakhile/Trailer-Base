import React, { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import MediaCard from "./MediaCard"; // Adjust import path as needed
import Loading from "@/components/Loading"; // Adjust import path as needed
import { LeftIcon, RightIcon } from "./icons/Icons";

interface MediaProps {
  id: number;
  title?: string; // Optional for TV
  name?: string; // Optional for TV
  release_date?: string; // Optional for movies, first_air_date for TV
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
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="w-full flex flex-col items-start justify-center gap-4 ">
      <div className="w-full flex items-center justify-between px-4">
        <h2 className="text-2xl max-sm:text-xl lg:text-4xl text-gray-100 font-medium capitalize tracking-tight">
          {title}
        </h2>
        <Link
          to={`/${mediaType}/list/$list`}
          params={{ list: list }}
          search={{ page: 1 }}>
          <button className="px-3 py-2 text-sm font-medium text-white bg-blue-700 backdrop-blur-md rounded-md hover:bg-blue-900/80 hover:text-white transition-all duration-300">
            View All {title}
          </button>
        </Link>
      </div>
      <div className="h-4" />
      {isLoading && (
        <div className="w-full text-center">
          <Loading />
        </div>
      )}
      {isError && (
        <div className="w-full text-center text-red-400 font-medium">
          Error: {error?.message ?? "An error occurred"}
        </div>
      )}
      <div className="relative w-full">
        <button
          onClick={scrollLeft}
          aria-label="Scroll Left"
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-[rgba(255,255,255,0.1)] rounded-md p-2 sm:p-3.5 opacity-0.3 hover:opacity-80 hover:bg-blue-900/20 hover:scale-105 transition-all duration-300 ease-in-out ring-1 ring-blue-400/10 focus:ring-2 focus:ring-blue-500/50 z-10">
          <LeftIcon />
        </button>
        <motion.div
          ref={scrollRef}
          className="w-full flex overflow-x-scroll scrollbar-hide items-start gap-2 lg:gap-8 lg:px-10"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}>
          {data?.results?.map((item: MediaProps) => (
            <motion.div
              key={item.id}
              variants={cardVariants}
              className="cursor-pointer">
              <MediaCard
                id={item.id}
                title={item.title || item.name || "Untitled"} // Use name for TV
                release_date={item.release_date || item.first_air_date || ""}
                poster_path={item.poster_path}
                vote_average={item.vote_average}
                type={mediaType}
              />
            </motion.div>
          ))}
        </motion.div>
        <button
          onClick={scrollRight}
          aria-label="Scroll Right"
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-[rgba(255,255,255,0.1)] rounded-md p-2 sm:p-3.5 opacity-0.3 hover:opacity-80 hover:bg-blue-900/20 hover:scale-105 transition-all duration-300 ease-in-out ring-1 ring-blue-400/10 focus:ring-2 focus:ring-blue-500/50 z-10">
          <RightIcon />
        </button>
      </div>
    </section>
  );
};

export default MediaList;