import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/tv')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <p>tv page</p>
    
    <Outlet />
  </div>
}
