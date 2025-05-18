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
      to={type == "movie" ? "/movie/$movieId" : "/tv/$tvId"}
      params={type == "movie" ? { movieId: id } : { tvId: id }}
      onClick={() => setStatus(false)}
      className="grid grid-cols-[102px_auto]  w-full h-[171px] rounded-lg hover:scale-95  transition duration-300 ease-in-out transform">
      <img
        src={
          poster_path
            ? `https://image.tmdb.org/t/p/w500/${poster_path}`
            : "https://raw.githubusercontent.com/dumisa-sakhile/CinemaLand/refs/heads/main/public/poster.png"
        }
        alt={title}
        className="w-full object-cover rounded-lg"
      />

      <div className="flex flex-col justify-end p-4 gap-2">
        <span className="text-xs text-yellow-500 font-bold">
          {vote_average}/10
        </span>
        <p className="capitalize">{type}</p>
        <p>{release_date}</p>
        <h3 className="text-sm text-gray-300">{title}</h3>
      </div>
    </Link>
  );
};

export default SearchCard;
