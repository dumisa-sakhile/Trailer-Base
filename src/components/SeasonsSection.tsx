import{ useRef } from "react";
import SeasonCard from "./SeasonCard";

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

interface SeasonsSectionProps {
  seasons: Season[];
}

export default function SeasonsSection({ seasons }: SeasonsSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -200 : 200;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  if (!seasons?.length) return null;

  return (
    <section className="flex flex-col gap-6 relative">
      <h2 className="text-3xl max-sm:text-2xl lg:text-4xl font-medium tracking-tight ">
        Seasons
      </h2>
      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[#131313] hover:bg-[#333] p-2 rounded-full"
          aria-label="Scroll left">
          <svg
            className="w-5 h-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m15 19-7-7 7-7"
            />
          </svg>
        </button>
        <div className="w-full overflow-x-scroll" ref={scrollRef}>
          <div className="flex gap-6 p-4">
            {seasons.map((season) => (
              <SeasonCard key={season.id} season={season} />
            ))}
          </div>
        </div>
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[#131313] hover:bg-[#333] p-2 rounded-full"
          aria-label="Scroll right">
          <svg
            className="w-5 h-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m9 5 7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}
