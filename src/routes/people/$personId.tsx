import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/people/$personId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/people/$personId"!</div>
}
