import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tv/_layout/on-the-air')({
  validateSearch: (search: Record<string, string>) => ({
    page: search.page ? parseInt(search.page) : 1,
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return <div>on-the-air"!</div>
}
