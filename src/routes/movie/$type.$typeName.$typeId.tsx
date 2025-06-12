import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query';
import { getMoviesType } from '@/api/movie';
import { Link, HeadContent } from "@tanstack/react-router";
import BackHomeBtn from '@/components/BackHomeBtn';
import Loading from '@/components/Loading';
import MediaCard from '@/components/MediaCard';



interface MovieProps {
  id: number;
  title: string;
  release_date: string;
  poster_path: string;
  vote_average : number;
}

export const Route = createFileRoute("/movie/$type/$typeName/$typeId")({
  validateSearch: (search: Record<string, string>) => ({
    page: search.page ? parseInt(search.page) : 1,
  }),
  loader: async ({ params }) => {
    return {
      type: params.type,
      typeName: params.typeName,
      typeId: params.typeId,
    };
  },
  head: ({ params }) => ({
    meta: [
      {
        title: `Trailer Base - ${params.typeName} movies`,
      },
    ],
  }),
  component: TypeComponent,
});

function TypeComponent() {
  const { type, typeName, typeId } = Route.useLoaderData();
  const { page } = Route.useSearch();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["movies", type, typeName, typeId, page],
    queryFn: () =>
      getMoviesType(
        page,
        type as
          | "with_original_language"
          | "with_companies"
          | "with_origin_country"
          | "with_genres",
        typeId as string
      ),
  });


  
  return (
    <>
      <HeadContent />
      <div className="fixed top-0 left-0 w-full h-full pt-[15%] md:pt-[5%] p-4 md:pl-10 lg:pl-20 flex flex-col gap-8 pb-10 overflow-x-auto">
        <h1 className="-mt-10 text-2xl text-left geist-bold capitalize">
          {typeName} Movies
        </h1>
        <section className="w-full min-h-1/2 md:p-4 flex flex-wrap items-start justify-center gap-2 lg:gap-10 ">
          {isLoading && <Loading />}
          {isError && <div>Error: {error.message}</div>}

          {data?.results.map(
            ({
              id,
              title,
              release_date,
              poster_path,
              vote_average,
            }: MovieProps) => (
              <MediaCard
                key={id}
                id={id}
                title={title}
                release_date={release_date}
                poster_path={poster_path}
                vote_average={vote_average}
                type="movie"
              />
            )
          )}
        </section>
        <br /><br /><br />

        {/* back & home button */}
        <BackHomeBtn />
      </div>

      {!isLoading && !isError && (
        <footer className="fixed bottom-4 left-0 right-0 flex items-center justify-center w-full z-20 pointer-events-none">
          <section className="flex items-center gap-3 bg-[rgba(24,24,28,0.85)] backdrop-blur-lg px-6 py-3 max-sm:px-3 max-sm:py-2 rounded-xl shadow-lg border border-gray-700/40 font-sans pointer-events-auto">
            <Link
              to="."
              params={{ type, typeId: String(typeId), typeName }}
              search={(prev) => ({ ...prev, page: page - 1 })}
              className={`flex items-center gap-2 px-4 py-2 max-sm:px-3 max-sm:py-1.5 text-gray-200 font-medium text-base max-sm:text-xs roboto-condensed-bold capitalize rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/60 ${
                page === 1
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-blue-600/80 hover:text-white hover:shadow-lg hover:scale-[1.06] active:scale-100"
              }`}
              disabled={page === 1}
              aria-label="Go to previous page"
              tabIndex={page === 1 ? -1 : 0}>
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
              <span className="max-sm:hidden">Previous</span>
              <span className="sm:hidden">Prev</span>
            </Link>
            <span className="text-gray-100 font-semibold text-base max-sm:text-xs  px-4 max-sm:px-2 select-none">
              {page?.toLocaleString()} <span className="opacity-60">/</span>{" "}
              {data?.total_pages?.toLocaleString() ?? "?"}
            </span>
            <Link
              to="."
              params={{ type, typeId: String(typeId), typeName }}
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
