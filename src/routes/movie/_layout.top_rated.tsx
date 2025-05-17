import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute("/movie/_layout/top_rated")({
  validateSearch: (search: Record<string, string>) => ({
    page: search.page ? parseInt(search.page) : 1,
  }),
  component: TopRated,
});

function TopRated() {
  return <div>top rated</div>
}
