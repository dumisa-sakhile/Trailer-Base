import { createFileRoute, Outlet } from '@tanstack/react-router';


export const Route = createFileRoute('/movie')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-no-repeat bg-center">
      <img
        alt=""
        loading="lazy"
        decoding="async"
        data-nimg="1"
        className="w-full h-full object-cover fixed hidden lg:block filter blur-2xl"
        src="https://image.tmdb.org/t/p/original//wSJHuSD7ojzoXifWjOAjxV7UpEL.jpg"
      />

      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50">
        <Outlet />
      </div>
    </div>
  );
}
