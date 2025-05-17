import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute("/movie/_layout/upcoming")({
  validateSearch: (search: Record<string, string>) => ({
    page: search.page ? parseInt(search.page) : 1,
  }),
  component: Upcoming,
});

function Upcoming() {
  return <div>upcoming</div>
}
