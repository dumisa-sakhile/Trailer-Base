import Search from '@/components/Search';
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import {  useSearchContext } from '@/context/searchContext';

export const Route = createRootRoute({
  component: () => (
    <>
        
        {useSearchContext().status && (
        <Search />)}
        <section className="fixed top-0 left-0 w-full h-full bg-black/90 backdrop-blur-md z-10 overflow-auto">
          <Outlet />
        </section>
        <TanStackRouterDevtools />
    </>
  ),
});
