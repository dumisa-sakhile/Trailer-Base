import React from "react";
import { Link } from "@tanstack/react-router";
import { useSearchContext } from "@/context/searchContext";

interface SearchCardProps {
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  type: string;
  url: string;
  id: string;
}

const SearchCard: React.FC<SearchCardProps> = ({
  title,
  poster_path,
  release_date,
  vote_average,
  type,
  url,
  id,
}) => {
  const { setStatus } = useSearchContext();

  return (
    <Link
      to={url}
      params={
        type === "movie"
          ? { movieId: id }
          : type === "tv"
            ? { tvId: id }
            : { personId: id }
      }
      onClick={() => setStatus(false)}
      className="group flex w-full max-w-[320px] h-[180px] bg-[rgba(24,24,24,0.95)] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 ease-in-out transform focus:scale-[1.03] focus:ring-2 focus:ring-[#FACC15]/50 outline-none backdrop-blur-sm border border-gray-800/30">
      <div className="relative w-[120px] h-full">
        <img
          src={`https://image.tmdb.org/t/p/w500/${poster_path}`}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="flex flex-col justify-between p-4 flex-1">
        {type !== "person" && vote_average > 0 && (
          <div className="flex items-center gap-2">
            <svg
              aria-hidden="true"
              className="w-5 h-5 text-[#FACC15]"
              fill="currentColor"
              viewBox="0 0 576 512"
              xmlns="http://www.w3.org/2000/svg">
              <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z" />
            </svg>
            <span className="text-sm font-semibold text-[#FACC15]">
              {vote_average.toFixed(1)}/10
            </span>
          </div>
        )}
        <p className="text-xs text-gray-400 uppercase font-medium tracking-wider">
          {type === "person"
            ? "Person"
            : type === "movie"
              ? "Movie"
              : "TV Show"}
        </p>
        {type !== "person" && release_date && (
          <p className="text-xs text-gray-500">{release_date}</p>
        )}
        <h3 className="text-base font-bold text-white line-clamp-2 leading-tight">
          {title}
        </h3>
      </div>
    </Link>
  );
};

export default SearchCard;
