import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/people')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <p>people page</p>
    
    <Outlet />
  </div>
}
