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
      <div className="fixed top-0 left-0 w-full h-full pt-[10%] md:pt-[5%] p-4 md:pl-10 lg:pl-20 flex flex-col gap-8 pb-10 overflow-x-auto">
        <h1 className="-mt-10 text-2xl text-left geist-bold capitalize">
          {typeName} Movies
        </h1>
        <section className="w-full min-h-1/2 p-4 flex flex-wrap items-start justify-center gap-10">
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

        {/* back & home button */}
        <BackHomeBtn />
      </div>

      {/* Pagination */}
      {!isLoading && !isError && (
        <footer className="fixed bottom-4 min-w-[10px] flex items-center justify-center  w-full gap-2 touch-none">
          <section className="flex items-center gap-2 bg-black px-4 py-2 rounded-md ring-1 ring-[rgba(37,37,37,0.5)] roboto-condensed-regular">
            <Link
              to="."
              params={{ type, typeId: String(typeId), typeName }}
              search={(prev) => ({ ...prev, page: page - 1 })}
              className="text-white capitalize rounded-lg px-6 py-2 flex items-center gap-2 transition duration-300 ease-in-out hover:scale-95 hover:bg-[rgba(255,255,255,0.1)]"
              disabled={page === 1}>
              <svg
                className="w-6 h-6 text-white"
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
                  strokeWidth="1.7"
                  d="m15 19-7-7 7-7"
                />
              </svg>
              previous
            </Link>
            <span className="text-white capitalize">
              {page?.toLocaleString()} of{" "}
              {data?.total_pages?.toLocaleString() ?? "?"} pages
            </span>
            <Link
              to="."
              params={{ type, typeId: String(typeId), typeName }}
              search={(prev) => ({ ...prev, page: page + 1 })}
              disabled={data?.total_pages === page}
              className="text-white capitalize rounded-lg px-6 py-2 flex items-center gap-2 transition duration-300 ease-in-out hover:scale-95 hover:bg-[rgba(255,255,255,0.1)]">
              next
              <svg
                className="w-6 h-6 text-white"
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
                  strokeWidth="1.7"
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
