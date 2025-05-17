import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: () => (
      <section className="fixed top-0 left-0 w-full h-full bg-black/90 backdrop-blur-md z-10 overflow-auto">
      
        <Outlet />
        <TanStackRouterDevtools/>
      </section>
  ),
});
