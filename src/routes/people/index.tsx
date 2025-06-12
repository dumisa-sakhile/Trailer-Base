import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getTrendingPeople, getPopularPeople } from "@/api/people";
import Header from "@/components/Header";
import { useSearchContext } from "@/context/searchContext";
import { useEffect, useRef, useState } from "react";
import CastCard from "@/components/PeopleCastCard";
import Loading from "@/components/Loading";
import Footer from "@/components/Footer";
import { LeftIcon, RightIcon } from "@/components/icons/Icons";

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
    <div className="w-full  pt-30  flex flex-col gap-4 bg-black text-white">
      <Header />
      <title>Trailer Base - People</title>

      <section className="w-full flex flex-col items-center justify-center gap-4 py-4">
        <h1 className="text-3xl max-sm:text-2xl lg:text-4xl font-medium tracking-tight text-center">
          Trailer Base - People
        </h1>
        <p className="text-sm sm:text-base font-light text-center max-w-2xl">
          Welcome to Trailer Base, where you can explore the stars of film and
          TV. These are the trending people of the{" "}
          <span className="font-semibold uppercase">{period}</span>.
        </p>
      </section>

      {/* Period Buttons */}
      <section className="flex items-center justify-center gap-2 py-2">
        <button
          onClick={() => setPeriod("day")}
          className={`button-style px-4 py-2 rounded-full transition-all duration-200 ${
            period === "day"
              ? "bg-[#333]/50 ring-1 ring-white/10"
              : "opacity-30 hover:opacity-80 hover:bg-blue-900/20 hover:scale-105 ring-1 ring-blue-400/10"
          }`}
          aria-label="View daily trending people">
          Day
        </button>
        <button
          onClick={() => setPeriod("week")}
          className={`button-style px-4 py-2 rounded-full transition-all duration-200 ${
            period === "week"
              ? "bg-[#333]/50 ring-1 ring-white/10"
              : "opacity-30 hover:opacity-80 hover:bg-blue-900/20 hover:scale-105 ring-1 ring-blue-400/10"
          }`}
          aria-label="View weekly trending people">
          Week
        </button>
      </section>

      {/* Trending People Carousel */}
      <section className="relative w-full max-w-[98vw] overflow-x-hidden py-4">
        <div className="flex items-center justify-between mb-4 px-4">
          <h2 className="text-2xl font-bold">Trending People</h2>
          <div className="flex gap-2">
            <button
              onClick={() => scrollCarousel("left")}
              aria-label="Scroll left"
              className="bg-[rgba(255,255,255,0.1)] rounded-md p-2 sm:p-3.5 opacity-30 hover:opacity-80 hover:bg-blue-900/20 hover:scale-105 transition-all duration-200 will-change-transform ring-1 ring-blue-400/10 focus:ring-2 focus:ring-blue-500/50">
              <LeftIcon />
            </button>
            <button
              onClick={() => scrollCarousel("right")}
              aria-label="Scroll right"
              className="bg-[rgba(255,255,255,0.1)] rounded-md p-2 sm:p-3.5 opacity-30 hover:opacity-80 hover:bg-blue-900/20 hover:scale-105 transition-all duration-200 will-change-transform ring-1 ring-blue-400/10 focus:ring-2 focus:ring-blue-500/50">
              <RightIcon />
            </button>
          </div>
        </div>
        {trendingLoading ? (
          <Loading />
        ) : trendingError ? (
          <p className="text-center text-red-500">
            Error loading trending people: {trendingErrorObj?.message}
          </p>
        ) : (
          <div
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto pb-4 px-4 snap-x snap-mandatory scroll-smooth"
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

      {/* Popular People (paginated) */}
      <section className="py-6 bg-black flex flex-col items-center justify-center gap-4">
        <h2 className="text-3xl text-center font-bold">Popular People</h2>
        <p className="text-sm sm:text-base font-light text-center max-w-2xl">
          Explore some of the most popular stars in film and television.
        </p>
        <div className="w-full">
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 px-4">
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
        {!popularLoading && !popularError && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <Link
              to="/people"
              search={(prev) => ({
                ...prev,
                page: page - 1,
              })}
              className={`flex items-center gap-1.5 bg-[rgba(255,255,255,0.1)] rounded-md px-4 py-2 text-sm font-semibold uppercase transition-all duration-200 ring-1 ring-blue-400/10 focus:ring-2 focus:ring-blue-500/50 ${
                page === 1
                  ? "opacity-30 cursor-not-allowed"
                  : "opacity-80 hover:opacity-100 hover:bg-blue-900/20 hover:scale-105"
              }`}
              disabled={page === 1}
              aria-label="Go to previous popular page">
              <LeftIcon />
              Prev
            </Link>
            <span className="text-gray-200 text-sm font-light px-3">
              {page?.toLocaleString()} /{" "}
              {popularData?.total_pages?.toLocaleString() ?? "?"}
            </span>
            <Link
              to="/people"
              search={(prev) => ({
                ...prev,
                page: page + 1,
              })}
              className={`flex items-center gap-1.5 bg-[rgba(255,255,255,0.1)] rounded-md px-4 py-2 text-sm font-semibold uppercase transition-all duration-200 ring-1 ring-blue-400/10 focus:ring-2 focus:ring-blue-500/50 ${
                popularData?.total_pages === page
                  ? "opacity-30 cursor-not-allowed"
                  : "opacity-80 hover:opacity-100 hover:bg-blue-900/20 hover:scale-105"
              }`}
              disabled={popularData?.total_pages === page}
              aria-label="Go to next popular page">
              Next
              <RightIcon />
            </Link>
          </div>
        )}
      </section>

      {!trendingLoading && !popularLoading && <Footer />}
    </div>
  );
}

export default People;
