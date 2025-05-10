import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tv/_layout/popular')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/tv/_layout/popular"!</div>
}
