import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getTVType } from "@/api/tv";
import { HeadContent } from "@tanstack/react-router";
import BackHomeBtn from "@/components/BackHomeBtn";
import MediaCard from "@/components/MediaCard";
import MediaGridSkeleton from "@/components/MediaGridSkeleton"; // Import the new skeleton component
import PaginationFooter from "@/components/PaginationFooter";

interface TVProps {
  id: number;
  name: string;
  first_air_date: string;
  poster_path: string | null;
  vote_average: number;
}

export const Route = createFileRoute("/tv/$type/$typeName/$typeId")({
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
        title: `Trailer Base - ${params.typeName} TV Shows`,
      },
    ],
  }),
  component: TypeComponent,
});

function TypeComponent() {
  const { type, typeName, typeId } = Route.useLoaderData();
  const { page } = Route.useSearch();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["tv", type, typeName, typeId, page],
    queryFn: () =>
      getTVType(
        page,
        type as
          | "with_original_language"
          | "with_companies"
          | "with_origin_country"
          | "with_genres",
        typeId as string
      ),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  return (
    <>
      <HeadContent />
      {/* Conditional rendering for skeleton or actual content */}
      {isLoading ? (
        // Show the custom MediaGridSkeleton when data is loading
        <MediaGridSkeleton titleText={`${typeName} TV Shows`} />
      ) : (
        // Show actual content once loaded
        <div className="fixed top-0 left-0 w-full h-full pt-[15%] md:pt-[5%] md:p-4 md:pl-10 lg:pl-20 flex flex-col gap-8 pb-10 overflow-x-auto text-white">
          <h1 className="-mt-10 text-2xl text-left font-bold capitalize">
            {typeName} TV Shows
          </h1>
          <section className="w-full min-h-1/2 md:p-4 flex flex-wrap items-start justify-center gap-2 lg:gap-10">
            {isError && (
              <div className="text-red-500">Error: {error?.message}</div>
            )}

            {data?.results?.map(
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
                  title={name} // Map 'name' to 'title' for MediaCard
                  release_date={first_air_date} // Map 'first_air_date' to 'release_date'
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
            params: { type, typeId: String(typeId), typeName },
            search: (prev: any) => ({ ...prev, page: page - 1 }),
          }}
          nextLinkProps={{
            to: ".",
            params: { type, typeId: String(typeId), typeName },
            search: (prev: any) => ({ ...prev, page: page + 1 }),
          }}
        />
      )}
    </>
  );
}
