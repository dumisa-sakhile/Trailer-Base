import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/tv')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <title>Trailer Base - TV</title>
    
    <Outlet />
  </div>
}
