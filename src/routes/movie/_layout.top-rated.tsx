import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/movie/_layout/top-rated')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/movie/_layout/top-rated"!</div>
}
