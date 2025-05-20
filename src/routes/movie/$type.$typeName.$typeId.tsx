import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query';
import { getMoviesType } from '@/api/movie';
import { Link, HeadContent } from "@tanstack/react-router";
import BackHomeBtn from '@/components/BackHomeBtn';



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
          {isLoading && <div>Loading...</div>}
          {isError && <div>Error: {error.message}</div>}

          {data?.results.map(
            ({
              id,
              title,
              release_date,
              poster_path,
              vote_average,
            }: MovieProps) => (
              <Link
                // search={{ title: title }}
                to="/movie/$movieId"
                params={{ movieId: id.toString() }}
                key={id}
                className=" w-[300px] flex-none h-[450px] rounded-lg shadow-md flex items-center justify-center relative group hover:scale-95 transition-transform duration-300 ease-in-out overflow-hidden  geist-light hover:ring-1 hover:ring-black hover:rotate-3">
                <img
                  src={
                    poster_path
                      ? `https://image.tmdb.org/t/p/w500/${poster_path}`
                      : `https://github.com/dumisa-sakhile/CinemaLand/blob/main/public/poster.png?raw=truehttps://raw.githubusercontent.com/dumisa-sakhile/CinemaLand/refs/heads/main/public/poster.png`
                  }
                  alt={title}
                  className="w-full h-full object-cover rounded-lg overflow-hidden"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black   transition-opacity flex flex-col justify-end p-4 rounded-lg">
                  <p className="text-yellow-500 text-sm">{vote_average}</p>
                  <p className="text-white text-sm">{release_date}</p>
                  <h3 className="text-white text-lg">{title}</h3>
                </div>
              </Link>
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
              {page} of {data?.total_pages ?? "?"} pages
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
