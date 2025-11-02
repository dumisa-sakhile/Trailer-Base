import { createFileRoute, HeadContent } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getList } from "@/api/movie";
import BackHomeBtn from "@/components/BackHomeBtn";
import MediaCard from "@/components/MediaCard";
import MediaGridSkeleton from "@/components/MediaGridSkeleton"; // Import the new skeleton component
import PaginationFooter from "@/components/PaginationFooter";


interface MovieProps {
  id: number;
  title: string;
  release_date: string;
  poster_path: string;
  vote_average: number;
}

export const Route = createFileRoute("/movie/list/$list")({
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
        } movies`,
      },
    ],
  }),
  component: List,
});

function List() {
  const { list } = Route.useLoaderData();
  const { page } = Route.useSearch();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["movies", list, page],
    queryFn: () =>
      getList(
        page,
        list as "top_rated" | "upcoming" | "now_playing" | "popular"
      ),
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
        <MediaGridSkeleton titleText={`${formattedTitle} Movies`} />
      ) : (
        // Show actual content once loaded
        <div className="fixed top-0 left-0 w-full h-full pt-[35%] md:pt-[5%] p-4 md:pl-10 lg:pl-20 flex flex-col gap-8 pb-10 overflow-x-auto text-white">
          <h1 className="-mt-10 text-2xl text-left font-bold capitalize">
            {formattedTitle} Movies
          </h1>
          <section className=" min-h-1/2 md:p-4 flex flex-wrap items-start justify-center gap-2 lg:gap-10">
            {isError && (
              <div className="text-red-500">Error: {error.message}</div>
            )}

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
            <div className="w-full h-[70px]">
              {/* {empty div to provide spacing at the bottom of the section as this is the last element on the page} */}
            </div>
          </section>

          {/* back & home button */}
          <BackHomeBtn />
        </div>
      )}

      {/* Pagination footer - only show when not loading and no error */}
      {!isLoading && !isError && (
        <PaginationFooter
          page={page}
          totalPages={data?.total_pages}
          prevLinkProps={{
            to: ".",
            params: { list },
            search: (prev: any) => ({ ...prev, page: page - 1 }),
          }}
          nextLinkProps={{
            to: ".",
            params: { list },
            search: (prev: any) => ({ ...prev, page: page + 1 }),
          }}
        />
      )}
    </>
  );
}
