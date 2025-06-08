import React, { useRef } from "react";
import { Link } from "@tanstack/react-router";
import MediaCard from "./MediaCard"; // Adjust import path as needed
import Loading from "@/components/Loading"; // Adjust import path as needed
import { LeftIcon, RightIcon } from "./icons/Icons";

interface MediaProps {
  id: number;
  title: string;
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
          <button className="px-4 py-2 text-sm font-medium bg-[#333]/50 backdrop-blur-md  text-gray-100 transition-all duration-300">
            View All {title}
          </button>
        </Link>
      </div>
      <div className="h-4" /> {/* Replaces <br /> for cleaner spacing */}
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
        <div
          ref={scrollRef}
          className="w-full flex overflow-x-scroll scrollbar-hide items-start gap-2 lg:gap-8 lg:px-10">
          {data?.results?.map((item: MediaProps) => (
            <div key={item.id}>
              <MediaCard
                id={item.id}
                title={item.title}
                release_date={item.release_date || item.first_air_date || ""}
                poster_path={item.poster_path}
                vote_average={item.vote_average}
                type={mediaType}
              />
            </div>
          ))}
        </div>
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