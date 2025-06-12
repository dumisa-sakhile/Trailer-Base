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
  type,
  url,
  id,
}) => {
  const { setStatus } = useSearchContext();

  return (
    <div className="relative w-[160px] h-[240px] sm:w-[180px] sm:h-[270px]">
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
        className="block w-full h-full rounded-3xl overflow-hidden shadow-md hover:ring-1 hover:ring-white/10 transition-all duration-300 ease-in-out focus:ring-1 focus:ring-white/10 outline-none bg-[rgba(10,10,10,0.95)]"
        aria-label={`View ${type === "movie" ? "movie" : type === "tv" ? "TV show" : "person"}: ${title}`}>
        <div className="relative w-full h-full ">
          <img
            src={`https://image.tmdb.org/t/p/w500/${poster_path}`}
            alt={title}
            className="w-full h-full object-cover opacity-0 transition-opacity duration-300"
            loading="lazy"
            onLoad={(e) => {
              e.currentTarget.classList.add("opacity-100");
            }}
          />
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/95 via-black/50 to-transparent flex flex-col justify-end p-3">
            {type !== "person" && release_date && (
              <p className="text-[0.65rem] bricolage-grotesque-light text-gray-300 leading-tight">
                {release_date}
              </p>
            )}
            <h3 className="text-[0.75rem] sm:text-[0.875rem] bricolage-grotesque-bold text-white line-clamp-2 leading-tight">
              {title}
            </h3>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default SearchCard;
