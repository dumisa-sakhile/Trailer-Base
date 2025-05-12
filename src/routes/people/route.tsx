import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/people')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <title>Trailer Base - People</title>
    <p>people page</p>
    
    <Outlet />
  </div>
}
