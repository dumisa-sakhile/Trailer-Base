import { createFileRoute, HeadContent, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getTVList } from "@/api/tv";
import BackHomeBtn from "@/components/BackHomeBtn";
import Loading from "@/components/Loading";
import MediaCard from "@/components/MediaCard";

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
    queryFn: () =>
      getTVList(
        page,
        list as  "top_rated" | "popular"
      ),
  });

  return (
    <>
      <HeadContent />
      <div className="fixed top-0 left-0 w-full h-full pt-[15%] md:pt-[5%] md:p-4 md:pl-10 lg:pl-20 flex flex-col gap-8 pb-10 overflow-x-auto">
        <h1 className="-mt-10 text-2xl text-left geist-bold capitalize">
          {list.replace(/_/g, " ").charAt(0).toUpperCase() +
            list.replace(/_/g, " ").slice(1)}{" "}
          TV Shows
        </h1>
        <section className="w-full min-h-1/2 md:p-4 flex flex-wrap items-start justify-center gap-2 lg:gap-10">
          {isLoading && <Loading />}
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
        </section>

        <BackHomeBtn />
      </div>

      {!isLoading && !isError && (
        <footer className="fixed bottom-4 left-0 right-0 flex items-center justify-center w-full gap-2 touch-none z-20">
          <section className="flex items-center gap-2 bg-[rgba(0,0,0,0.85)] backdrop-blur-md px-4 py-2 max-sm:px-3 max-sm:py-1.5 rounded-lg shadow-sm border border-gray-600/50 font-sans">
            <Link
              to="."
              params={{ list: list }}
              search={(prev) => ({ ...prev, page: page - 1 })}
              className={`flex items-center gap-1.5 px-4 py-2 max-sm:px-3 max-sm:py-1.5 text-gray-200 font-medium text-sm max-sm:text-xs roboto-condensed-bold capitalize rounded-md transition-all duration-200 ease-in-out border border-gray-600/50 ${
                page === 1
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-800 hover:text-white hover:shadow-md hover:scale-105"
              }`}
              disabled={page === 1}
              aria-label="Go to previous page">
              <svg
                className="w-5 h-5 max-sm:w-4 max-sm:h-4"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m15 19-7-7 7-7"
                />
              </svg>
              Prev
            </Link>
            <span className="text-gray-200 font-medium text-sm max-sm:text-xs roboto-condensed-light px-3 max-sm:px-2">
              {page?.toLocaleString()} /{" "}
              {data?.total_pages?.toLocaleString() ?? "?"}
            </span>
            <Link
              to="."
              params={{ list: list }}
              search={(prev) => ({ ...prev, page: page + 1 })}
              className={`flex items-center gap-1.5 px-4 py-2 max-sm:px-3 max-sm:py-1.5 text-gray-200 font-medium text-sm max-sm:text-xs roboto-condensed-bold capitalize rounded-md transition-all duration-200 ease-in-out border border-gray-600/50 ${
                data?.total_pages === page
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-800 hover:text-white hover:shadow-md hover:scale-105"
              }`}
              disabled={data?.total_pages === page}
              aria-label="Go to next page">
              Next
              <svg
                className="w-5 h-5 max-sm:w-4 max-sm:h-4"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m9 5 7 7-7 7"
                />
              </svg>
            </Link>
          </section>
        </footer>
      )}
    </>
  );
}
