import { createFileRoute, HeadContent, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getTVList } from "@/api/tv";
import BackHomeBtn from "@/components/BackHomeBtn";
import MediaCard from "@/components/MediaCard";
import MediaGridSkeleton from "@/components/MediaGridSkeleton"; // Import the new skeleton component
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TVProps {
  id: number;
  name: string;
  first_air_date: string;
  poster_path: string;
  vote_average: number;
}

export const Route = createFileRoute("/tv/list/$list")({
  validateSearch: (search: Record<string, string>) => ({
    page: search.page ? parseInt(search.page) : 1,
  }),
  loader: async ({ params }) => {
    return {
      list: params.list,
    };
  },
  head: ({ params }) => ({
    meta: [
      {
        title: `Trailer Base - ${
          params.list.replace(/_/g, " ").charAt(0).toUpperCase() +
          params.list.replace(/_/g, " ").slice(1)
        } TV Shows`,
      },
    ],
  }),
  component: List,
});

function List() {
  const { list } = Route.useLoaderData();
  const { page } = Route.useSearch();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["tv", list, page],
    queryFn: () => getTVList(page, list as "top_rated" | "popular"),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const formattedTitle =
    list.replace(/_/g, " ").charAt(0).toUpperCase() +
    list.replace(/_/g, " ").slice(1);

  return (
    <>
      <HeadContent />
      {/* Conditional rendering for skeleton or actual content */}
      {isLoading ? (
        // Show the custom MediaGridSkeleton when data is loading
        <MediaGridSkeleton titleText={`${formattedTitle} TV Shows`} />
      ) : (
        // Show actual content once loaded
        <div className="fixed top-0 left-0 w-full h-full pt-[15%] md:pt-[5%] md:p-4 md:pl-10 lg:pl-20 flex flex-col gap-8 pb-10 overflow-x-auto text-white">
          <h1 className="-mt-10 text-2xl text-left font-bold capitalize">
            {formattedTitle} TV Shows
          </h1>
          <section className="w-full min-h-1/2 md:p-4 flex flex-wrap items-start justify-center gap-2 lg:gap-10">
            {isError && <div>Error: {error.message}</div>}

            {data?.results.map(
              ({
                id,
                name,
                first_air_date,
                poster_path,
                vote_average,
              }: TVProps) => (
                <MediaCard
                  key={id}
                  id={id}
                  title={name}
                  release_date={first_air_date}
                  poster_path={poster_path}
                  vote_average={vote_average}
                  type="tv"
                />
              )
            )}
            <div className="w-full h-[70px]">
              {/* {empty div to provide spacing at the bottom of the section as this is the last element on the page} */}
            </div>
          </section>

          <BackHomeBtn />
        </div>
      )}

      {/* Pagination footer - only show when not loading and no error */}
      {!isLoading && !isError && (
        <footer className="fixed bottom-4 left-0 right-0 flex items-center justify-center w-full z-20 pointer-events-none">
          <section className="flex items-center gap-3 bg-[rgba(24,24,28,0.85)] backdrop-blur-lg px-6 py-3 max-sm:px-3 max-sm:py-2 rounded-xl shadow-lg border border-gray-700/40 font-sans pointer-events-auto">
            <Link
              to="."
              params={{}}
              search={(prev) => ({ ...prev, page: page - 1 })}
              className={`flex items-center gap-2 px-4 py-2 max-sm:px-3 max-sm:py-1.5 text-gray-200 font-medium text-base max-sm:text-xs roboto-condensed-bold capitalize rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/60 ${
                page === 1
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-blue-600/80 hover:text-white hover:shadow-lg hover:scale-[1.06] active:scale-100"
              }`}
              disabled={page === 1}
              aria-label="Go to previous page"
              tabIndex={page === 1 ? -1 : 0}>
              <ChevronLeft className="w-5 h-5 max-sm:w-4 max-sm:h-4" />
              <span className="max-sm:hidden">Previous</span>
              <span className="sm:hidden">Prev</span>
            </Link>
            <span className="text-gray-100 font-semibold text-base max-sm:text-xs px-4 max-sm:px-2 select-none">
              {page?.toLocaleString()} /{" "}
              {data?.total_pages?.toLocaleString() ?? "?"}
            </span>
            <Link
              to="."
              params={{}}
              search={(prev) => ({ ...prev, page: page + 1 })}
              className={`flex items-center gap-2 px-4 py-2 max-sm:px-3 max-sm:py-1.5 text-gray-200 font-medium text-base max-sm:text-xs roboto-condensed-bold capitalize rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/60 ${
                data?.total_pages === page
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-blue-600/80 hover:text-white hover:shadow-lg hover:scale-[1.06] active:scale-100"
              }`}
              disabled={data?.total_pages === page}
              aria-label="Go to next page"
              tabIndex={data?.total_pages === page ? -1 : 0}>
              <span className="max-sm:hidden">Next</span>
              <ChevronRight className="w-5 h-5 max-sm:w-4 max-sm:h-4" />
            </Link>
          </section>
        </footer>
      )}
    </>
  );
}
