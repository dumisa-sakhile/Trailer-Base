import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute("/movie/_layout/top_rated")({
  validateSearch: (search: Record<string, string>) => ({
    page: search.page ? parseInt(search.page) : 1,
  }),
  component: TopRated,
});

function TopRated() {
  return <div>
    <title>Trailer Base - Top Rated</title>
    top rated</div>
}
