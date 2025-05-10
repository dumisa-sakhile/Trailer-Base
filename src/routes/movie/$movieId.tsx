import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/movie/$movieId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/movie/$movieId"!</div>
}
