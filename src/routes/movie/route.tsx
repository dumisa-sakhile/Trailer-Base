import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/movie')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      
      <Outlet />
    </>
  );
}
