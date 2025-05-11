import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tv/_layout/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>tv home!</div>
}
