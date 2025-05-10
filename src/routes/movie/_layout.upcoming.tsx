import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/movie/_layout/upcoming')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/movie/_layout/upcoming"!</div>
}
