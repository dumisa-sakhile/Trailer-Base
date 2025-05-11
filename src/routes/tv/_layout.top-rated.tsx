import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tv/_layout/top-rated')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>top-rated"!</div>
}
