import { createFileRoute, HeadContent } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getTVList } from "@/api/tv";
import BackHomeBtn from "@/components/BackHomeBtn";
import MediaCard from "@/components/MediaCard";
import MediaGridSkeleton from "@/components/MediaGridSkeleton"; // Import the new skeleton component
import PaginationFooter from "@/components/PaginationFooter";


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
        <div className="fixed top-0 left-0 w-full h-full pt-[35%] md:pt-[5%] md:p-4 md:pl-10 lg:pl-20 flex flex-col gap-8 pb-10 overflow-x-auto text-white">
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
        <PaginationFooter
          page={page}
          totalPages={data?.total_pages}
          prevLinkProps={{
            to: ".",
            params: {},
            search: (prev: any) => ({ ...prev, page: page - 1 }),
          }}
          nextLinkProps={{
            to: ".",
            params: {},
            search: (prev: any) => ({ ...prev, page: page + 1 }),
          }}
        />
      )}
    </>
  );
}
