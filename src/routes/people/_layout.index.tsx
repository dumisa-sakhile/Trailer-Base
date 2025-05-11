import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/people/_layout/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/people/_layout/"!</div>
}
