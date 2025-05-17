import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute("/movie/_layout/popular")({
  validateSearch: (search: Record<string, string>) => ({
    page: search.page ? parseInt(search.page) : 1,
  }),
  component: Popular,
});

function Popular() {
  return <div>popular</div>
}
