import { Outlet, createRootRoute, useLocation } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Header from "@/components/Header"; // Import the Header component

export const Route = createRootRoute({
  component: () => {
    const location = useLocation(); // Get the current location
    const showHeaderRoutes = ["/", "/tv", "/people", "/search"]; // Routes where the Header should be visible

    // Determine if the current path starts with any of the allowed header routes
    // Special handling for '/' to ensure it only matches the root exactly
    const shouldShowHeader = showHeaderRoutes.some((route) =>
      route === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(route)
    );

    return (
      <>
        {/* Conditionally render the Header component */}
        {shouldShowHeader && <Header />}

        {/* 
          Add left padding for sidebar ONLY on desktop (md:pl-[82px]), 
          but keep no padding on mobile to allow the mobile nav to cover full width.
          The value [82px] matches the sidebar's collapsed width in Header.tsx.
        */}
        <section
          className={`absolute top-0 left-0 w-full h-screen bg-gradient-to-br from-gray-950 to-black z-10 overflow-auto ${
            shouldShowHeader ? "md:pl-[56px]" : ""
          }`}>
          {/* The Outlet renders the currently matched route component */}
          <Outlet />
        </section>

        {/* TanStack Router Devtools for debugging routes */}
        <TanStackRouterDevtools />
      </>
    );
  },
});
