import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tv/$tvId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>tvId"!</div>
}
