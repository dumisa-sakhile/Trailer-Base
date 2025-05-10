import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/movie/_layout/now-playing')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/movie/_layout/now-playing"!</div>
}
