import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tv/_layout/airing-today')({
  validateSearch: (search: Record<string, string>) => ({
    page: search.page ? parseInt(search.page) : 1,
  }),
  component: RouteComponent,
})

function RouteComponent() {

  return <div>airing-today!</div>
}
