import BackHomeBtn from '@/components/BackHomeBtn'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/auth')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <BackHomeBtn/>
    <Outlet />
  </div>
}
