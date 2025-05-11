import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/movie')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>

    <p>movie page</p>
    
    <Outlet />
    
  </div>
}
