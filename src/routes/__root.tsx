import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      {/* <img
        alt=""
        loading="lazy"
        width="1920"
        height="1080"
        decoding="async"
        data-nimg="1"
        className="fixed top-0 ;left-0 w-full h-full object-cover  hidden lg:block"
        src="	https://image.tmdb.org/t/p/original//kVd3a9YeLGkoeR50jGEXM6EqseS.jpg"
      /> */}
      <section className="fixed top-0 left-0 w-full h-full bg-black/90 backdrop-blur-md z-10 overflow-auto">
        <Outlet />
        <TanStackRouterDevtools />
      </section>
    </>
  ),
});
