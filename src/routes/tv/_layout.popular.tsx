import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tv/_layout/popular')({
  validateSearch: (search: Record<string, string>) => ({
    page: search.page ? parseInt(search.page) : 1,
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return <div>popular"!</div>
}
