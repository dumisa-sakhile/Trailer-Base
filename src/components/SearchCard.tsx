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
  id,
}) => {
  const { setStatus } = useSearchContext();
  return (
    <Link
      to={type === "movie" ? "/movie/$movieId" : "/tv/$tvId"}
      params={type === "movie" ? { movieId: id } : { tvId: id }}
      onClick={() => setStatus(false)}
      className="grid grid-cols-[100px_1fr] w-full max-w-[300px] h-[160px] rounded-xl bg-[rgba(30,30,30,0.8)] backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-102 transition-all duration-300 ease-in-out transform ring-1 ring-gray-800/50">
      <img
        src={
          poster_path
            ? `https://image.tmdb.org/t/p/w500/${poster_path}`
            : "https://raw.githubusercontent.com/dumisa-sakhile/CinemaLand/refs/heads/main/public/poster.png"
        }
        alt={title}
        className="w-full h-full object-cover rounded-l-xl"
      />

      <div className="flex flex-col justify-between p-3 gap-1.5">
        <div className="flex items-center gap-2">
          <svg
            aria-hidden="true"
            className="w-4 h-4 text-[#FACC15]"
            fill="currentColor"
            viewBox="0 0 576 512"
            xmlns="http://www.w3.org/2000/svg">
            <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z" />
          </svg>
          <span className="text-xs font-bold text-[#FACC15]">
            {vote_average.toFixed(1)}/10
          </span>
        </div>
        <p className="text-[0.65rem] text-gray-400 uppercase font-medium tracking-wide">
          {type}
        </p>
        <p className="text-[0.65rem] text-gray-400">{release_date}</p>
        <h3 className="text-sm  text-white line-clamp-2">
          {title}
        </h3>
      </div>
    </Link>
  );
};

export default SearchCard;
