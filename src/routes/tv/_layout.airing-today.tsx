import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tv/_layout/airing-today')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>airing-today!</div>
}
