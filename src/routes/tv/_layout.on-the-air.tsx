import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tv/_layout/on-the-air')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/tv/_layout/on-the-air"!</div>
}
