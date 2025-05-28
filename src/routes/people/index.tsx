import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getTrendingPeople, getPopularPeople } from "@/api/people";
import Header from "@/components/Header";
import { useSearchContext } from "@/context/searchContext";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import CastCard from "@/components/PeopleCastCard";
import Loading from "@/components/Loading";

interface pageProps {
  page?: number;
}

export const Route = createFileRoute("/people/")({
  validateSearch: (search: Record<string, string>): pageProps => ({
    page: search.page ? parseInt(search.page) : 1,
  }),
  component: People,
});



function People() {
  const search = Route.useSearch();
  const { page = 1 } = search;
  const { setStatus } = useSearchContext();

  // Manually set trendingPage to 1
  const trendingPage = 1;

  // Set period as a state variable
  const [period, setPeriod] = useState("day");

  // Trending People Query
  const {
    data: trendingData,
    isLoading: trendingLoading,
    isError: trendingError,
    error: trendingErrorObj,
  } = useQuery({
    queryKey: ["trendingPeople", period, trendingPage],
    queryFn: () => getTrendingPeople(period, trendingPage),
    placeholderData: keepPreviousData,
  });

  // Popular People Query (now paginated)
  const {
    data: popularData,
    isLoading: popularLoading,
    isError: popularError,
    error: popularErrorObj,
  } = useQuery({
    queryKey: ["popularPeople", page],
    queryFn: () => getPopularPeople(page),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    setStatus(false);
  }, [setStatus]);

  // Carousel ref for trending people
  const carouselRef = useRef<HTMLDivElement>(null);

  // Carousel scroll handlers
  const scrollCarousel = (dir: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollBy({
        left: dir === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-full mt-[100px] md:mt-[120px] flex flex-col gap md:gap-5  min-h-10">
      <Header />
      <title>Trailer Base - People</title>

      <section className="min-w-[300px] mt-10 md:mt-0 w-full flex flex-col items-center justify-center gap-4">
        <h1 className="text-5xl max-sm:text-3xl text-center geist-bold">
          Trailer Base - People
        </h1>
        <p className="roboto-condensed-light w-[300px] md:w-full text-center">
          Welcome to Trailer Base, where you can explore the stars of film and
          TV. These are the trending people of the{" "}
          <span className="font-bold uppercase">{period}</span>.
        </p>
      </section>
      <br />

      {/* Period Buttons */}
      <section className="min-w-[300px] min-h-[50px] flex items-center justify-center gap-4">
        <Button
          onClick={() => setPeriod("day")}
          variant={period === "day" ? "primary" : "ghost"}
          aria-label="View daily trending people">
          Day
        </Button>
        <Button
          onClick={() => setPeriod("week")}
          variant={period === "week" ? "primary" : "ghost"}
          aria-label="View weekly trending people">
          Week
        </Button>
      </section>
      <br />

      {/* Trending People Carousel */}
      <section className="relative w-full max-w-[98vw] overflow-x-hidden">
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-2xl geist-bold">Trending People</h2>
          <div className="flex gap-2">
            <button
              onClick={() => scrollCarousel("left")}
              aria-label="Scroll left"
              className="bg-[#333] hover:bg-[#222] rounded-full p-2">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24">
                <path
                  d="M15 19l-7-7 7-7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button
              onClick={() => scrollCarousel("right")}
              aria-label="Scroll right"
              className="bg-[#333] hover:bg-[#222] rounded-full p-2">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24">
                <path
                  d="M9 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
        {trendingLoading ? (
          <Loading />
        ) : trendingError ? (
          <p className="text-center text-red-400">
            Error loading trending people: {trendingErrorObj?.message}
          </p>
        ) : (
          <div
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto pb-4 px-2 snap-x snap-mandatory scroll-smooth"
            style={{ WebkitOverflowScrolling: "touch" }}>
            {trendingData?.results.map((person: any) => (
              <div key={person.id} className="snap-start">
                <CastCard
                  id={person.id}
                  name={person.name}
                  profile_path={person.profile_path}
                  character={
                    person.character || person.known_for_department || "Actor"
                  }
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Popular People (paginated, no ugly box) */}
      <section className="pt-10 pb-10 bg-black text-gray-200 min-w-[300px] md:mt-0 flex flex-col items-center justify-center gap-6">
        <h2 className="text-3xl text-center geist-bold">Popular People</h2>
        <p className="roboto-condensed-light w-[300px] md:w-full text-center">
          Explore some of the most popular stars in film and television.
        </p>
        <div className="w-full min-h-[270px]">
          <div className="flex flex-wrap justify-center gap-8">
            {popularLoading || popularError ? (
              <p className="text-gray-400">
                {popularLoading ? (
                  <span>Loading popular people...</span>
                ) : (
                  `Failed to load popular people: ${popularErrorObj?.message}`
                )}
              </p>
            ) : (
              popularData?.results?.map((person: any) => (
                <CastCard
                  key={person.id}
                  id={person.id}
                  name={person.name}
                  profile_path={person.profile_path}
                  character={person.known_for_department || "Actor"}
                />
              ))
            )}
          </div>
        </div>
        {/* Pagination for Popular People */}
        {!popularLoading && !popularError && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <Link
              to="/people"
              search={(prev) => ({
                ...prev,
                page: page - 1,
              })}
              className={`flex items-center gap-2.5 px-6 py-3 text-gray-200 font-medium text-base capitalize rounded-lg transition-all duration-300 ease-in-out shadow-sm border border-gray-700/50 ${
                page === 1
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-white hover:text-black hover:shadow-md hover:scale-105"
              }`}
              disabled={page === 1}
              aria-label="Go to previous popular page">
              <svg className="w-7 h-7" aria-hidden="true" viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="m15 19-7-7 7-7"
                />
              </svg>
              Previous
            </Link>
            <span className="text-gray-200 font-medium text-base capitalize px-4">
              {page?.toLocaleString()} of{" "}
              {popularData?.total_pages?.toLocaleString() ?? "?"} pages
            </span>
            <Link
              to="/people"
              search={(prev) => ({
                ...prev,
                page: page + 1,
              })}
              className={`flex items-center gap-2.5 px-6 py-3 text-gray-200 font-medium text-base capitalize rounded-lg transition-all duration-300 ease-in-out shadow-sm border border-gray-700/50 ${
                popularData?.total_pages === page
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-white hover:text-black hover:shadow-md hover:scale-105"
              }`}
              disabled={popularData?.total_pages === page}
              aria-label="Go to next popular page">
              Next
              <svg className="w-7 h-7" aria-hidden="true" viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="m9 5 7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

export default People;
