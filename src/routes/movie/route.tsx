import { createFileRoute, Outlet, Link } from '@tanstack/react-router';
import logo from "/src/logo.svg";


export const Route = createFileRoute('/movie')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <header className="fixed top-0 left-0 w-full h-[70px] shadow  grid grid-cols-3 bg-inherit px-32 py-4">
        <nav className="flex items-center gap-4">
          <Link to="/">
            <img src={logo} alt="logo" className="w-12 h-12" />
          </Link>
          <Link to="/movie">Movies</Link>
          <Link to="/tv">TV</Link>
          <Link to="/people">People</Link>
        </nav>
        <nav className="flex items-center">
          <input
            type="search"
            name="search"
            id=""
            placeholder="Search a Movie, TV show..."
            className="p-2 rounded-full h-[48px] w-full bg-[#333] pl-8 outline-none geist-light text-sm"
          />
        </nav>
        <nav></nav>
      </header>
      <Outlet />
    </div>
  );
}
