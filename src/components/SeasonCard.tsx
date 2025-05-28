
export interface Season {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path?: string | null;
  season_number: number;
  vote_average: number;
}

interface SeasonCardProps {
  season: Season;
}

const FALLBACK_POSTER =
  "https://raw.githubusercontent.com/dumisa-sakhile/CinemaLand/main/public/poster.png";

export default function SeasonCard({ season }: SeasonCardProps) {
  return (
    <div className="flex-none w-[250px] h-[375px] max-sm:w-[180px] max-sm:h-[270px] rounded-lg shadow-md relative group hover:scale-95 hover:ring-1 hover:ring-gray-400 hover:rotate-3 transition-transform duration-300 ease-in-out overflow-hidden geist-light">
      <img
        src={
          season?.poster_path
            ? `https://image.tmdb.org/t/p/w500/${season?.poster_path}`
            : FALLBACK_POSTER
        }
        alt={season?.name || "Season Poster"}
        className="w-full h-full object-cover rounded-lg"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent flex flex-col justify-end p-4 max-sm:p-3 rounded-lg gap-2">
        <h3 className="text-white text-lg max-sm:text-base roboto-condensed-bold truncate">
          {season?.name}
        </h3>
        <p className="text-white text-sm max-sm:text-xs roboto-condensed-regular">
          Episodes: {season?.episode_count}
        </p>
        <p className="text-gray-300 text-sm max-sm:text-xs roboto-condensed-regular">
          Air Date: {season?.air_date || "N/A"}
        </p>
        <p className="text-white text-sm max-sm:text-xs roboto-condensed-regular flex items-center gap-1">
          <svg
            aria-hidden="true"
            className="w-4 h-4 max-sm:w-3 max-sm:h-3"
            style={{ color: "#ffffff" }}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 576 512">
            <path
              fill="currentColor"
              d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"
            />
          </svg>
          {season?.vote_average ? season?.vote_average.toFixed(1) : "N/A"}/10
        </p>
      </div>
    </div>
  );
}
