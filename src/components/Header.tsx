import { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { auth, db } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { Popcorn, Tv, AtSign, Search, LogIn } from "lucide-react";
import logo from "../logo.svg?url";
import male from "/male.jpg?url";
import female from "/female.jpg?url";

interface NavItem {
  icon: React.ComponentType<{ size: number; className?: string }>;
  path: string;
  label: string;
  search?: Record<string, any>;
  action?: () => void;
}

const Header = () => {
  const location = useLocation();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Define the allowed exact routes for the header to be visible
  const allowedExactRoutes = ["/", "/tv", "/people", "/auth", "/search"];

  // Check if the current pathname is either an exact match or follows /people/:personId pattern
  const shouldShowHeader =
    allowedExactRoutes.includes(location.pathname) ||
    /^\/people\/[^/]+$/.test(location.pathname);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const { data: userData } = useQuery({
    queryKey: ["userData", user?.uid],
    queryFn: async () => {
      if (!user?.uid) return {};
      const userDoc = await getDoc(doc(db, "users", user.uid));
      return userDoc.exists() ? userDoc.data() : {};
    },
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000,
  });

  const getProfileImage = () => {
    if (user?.photoURL) return user.photoURL;
    if ((userData as any)?.gender === "female") return female;
    return male;
  };

  const getSearchForPath = (path: string) => {
    switch (path) {
      case "/":
      case "/tv":
        return { period: "day", page: 1 };
      case "/people":
        return { page: 1 };
      case "/search":
        return { query: "", type: "movies", page: 1 };
      default:
        return undefined;
    }
  };

  const navItems: NavItem[] = [
    {
      icon: Popcorn,
      path: "/",
      label: "Movies",
    },
    {
      icon: Tv,
      path: "/tv",
      label: "TV Shows",
    },
    {
      icon: AtSign,
      path: "/people",
      label: "People",
    },
    {
      icon: Search,
      path: "/search",
      label: "Search",
    },
  ];

  const isActive = (path: string) =>
    path === "/"
      ? location.pathname === path
      : location.pathname.startsWith(path);

  const NavItemComponent: React.FC<{ item: NavItem; isMobile?: boolean }> = ({
    item,
    isMobile = false,
  }) => {
    const linkClasses = `relative flex items-center justify-center w-10 h-10 rounded-md transition-all duration-200 group ${
      isActive(item.path)
        ? "bg-white/15 text-white shadow-md"
        : "text-gray-400 hover:bg-white/5 hover:text-white"
    } ${isMobile ? "rounded-full !bg-transparent" : ""}`;

    const mobileTextClasses = `text-[10px] mt-1 font-medium ${
      isActive(item.path) ? "text-white" : "text-gray-400"
    }`;

    return (
      <div
        className={`group relative flex ${isMobile ? "flex-col items-center" : ""}`}>
        {item.action ? (
          <button
            onClick={item.action}
            aria-label={item.label}
            className={linkClasses}>
            <item.icon
              size={20}
              className="transition-transform duration-150 group-hover:scale-105"
            />
          </button>
        ) : (
          <Link
            to={item.path}
            search={getSearchForPath(item.path)}
            aria-label={item.label}
            className={linkClasses}>
            <item.icon
              size={20}
              className="transition-transform duration-150 group-hover:scale-105"
            />
          </Link>
        )}
        {!isMobile && (
          <span className="absolute left-full ml-3 px-3 py-1.5 rounded-md bg-[#333] text-sm text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-lg transform translate-x-2 group-hover:translate-x-0">
            {item.label}
            <span className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#333] rotate-45"></span>
          </span>
        )}
        {isMobile && <span className={mobileTextClasses}>{item.label}</span>}
      </div>
    );
  };

  // Conditionally render the header only on allowed routes
  if (!shouldShowHeader) {
    return null;
  }

  return (
    <>
      {/* Desktop/Tablet Sidebar */}
      <aside className="hidden md:flex flex-col w-14 fixed z-50 left-0 top-0 h-full bg-gray-950 backdrop-blur-xl p-2 items-center shadow-lg justify-between py-6 border-r border-gray-800/50">
        <Link
          to="/"
          search={{ period: "day", page: 1 }}
          className="mb-4 transform transition-transform duration-300 hover:scale-110 active:scale-95">
          <img
            src={logo}
            alt="Logo"
            className="w-8 h-8 rounded-full shadow-md"
          />
        </Link>

        <nav className="flex flex-col items-center gap-4 my-auto">
          {navItems.map((item) => (
            <NavItemComponent key={item.path} item={item} />
          ))}
        </nav>

        <div className="flex flex-col items-center gap-4 pt-4 border-t border-gray-700/20 w-full">
          {!loading && user ? (
            // Only the profile link is shown when logged in
            <Link
              to="/auth/profile"
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent transition-all duration-200 hover:border-white focus:outline-none focus:ring-2 focus:ring-white/50 shadow-md">
              <img
                src={getProfileImage()}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </Link>
          ) : (
            // Login button for logged out state
            <Link
              to="/auth"
              aria-label="Login"
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-blue-700/50 hover:bg-blue-600 transition-all duration-200 text-white shadow-lg">
              <LogIn size={20} />
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-[350px] bg-black/60 backdrop-blur-2xl rounded-3xl z-50 px-4 py-3 shadow-2xl">
        <div className="flex justify-around items-center h-full">
          {navItems.slice(0, 2).map((item) => (
            <NavItemComponent key={item.path} item={item} isMobile={true} />
          ))}

          <div className="relative -mt-8 flex justify-center items-center">
            {!loading && user ? (
              <Link
                to="/auth/profile"
                className={`w-16 h-16 flex items-center justify-center rounded-full border-4 ${
                  location.pathname.startsWith("/auth/profile")
                    ? "border-white"
                    : "border-gray-700"
                } overflow-hidden bg-gray-800 shadow-xl transition-all duration-200 hover:scale-105`}>
                <img
                  src={getProfileImage()}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </Link>
            ) : (
              <Link
                to="/auth"
                className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 shadow-xl hover:scale-105">
                <LogIn size={28} />
              </Link>
            )}
          </div>

          {navItems.slice(2).map((item) => (
            <NavItemComponent key={item.path} item={item} isMobile={true} />
          ))}
        </div>
      </nav>
    </>
  );
};

export default Header;
