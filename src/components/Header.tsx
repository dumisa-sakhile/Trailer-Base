import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { auth, db } from "../config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Home, Tv, Users, Search, LogIn, LogOut } from "lucide-react";
import logo from "../logo.svg?url";
import male from "/male.jpg?url";
import female from "/female.jpg?url";

interface NavItem {
  icon: React.ComponentType<{ size: number }>;
  path: string;
  label: string;
  action?: () => void;
}

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

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
    if (userData?.gender === "female") return female;
    return male;
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Successfully signed out!");
    } catch (error) {
      toast.error("Failed to sign out. Please try again.");
    }
  };

  const navItems: NavItem[] = [
    {
      icon: Home,
      path: "/",
      label: "Home",
      action: () =>
        navigate({
          to: "/",
          search: { period: "day", page: 1 },
        }),
    },
    {
      icon: Tv,
      path: "/tv",
      label: "TV Shows",
      action: () =>
        navigate({
          to: "/tv",
          search: { period: "day", page: 1 },
        }),
    },
    {
      icon: Users,
      path: "/people",
      label: "People",
      action: () =>
        navigate({
          to: "/people",
          search: { page: 1 },
        }),
    },
    {
      icon: Search,
      path: "/search",
      label: "Search",
      action: () =>
        navigate({
          to: "/search",
          search: { query: "", type: "movies", page: 1},
        }),
    },
  ];

  const isActive = (path: string) =>
    path === "/"
      ? location.pathname === path
      : location.pathname.startsWith(path);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col h-screen w-16  backdrop-blur-lg border-r border-gray-900 fixed z-50">
        <div className="flex flex-col items-center py-6 flex-grow">
          {/* Logo */}
          <Link to="/" search={{ period: "day", page: 1 }} className="mb-10">
            <img src={logo} alt="Logo" className="w-8 h-8" />
          </Link>
          {/* Navigation */}
          <nav className="flex flex-col items-center space-y-6 w-full px-2">
            {navItems.map((item) => (
              <div
                key={item.path}
                className="relative group w-full flex justify-center">
                {item.action ? (
                  <button
                    onClick={item.action}
                    aria-label={item.label}
                    className={`p-2 rounded-lg transition-all ${
                      isActive(item.path)
                        ? "text-blue-400 bg-blue-900/20"
                        : "text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
                    tabIndex={0}>
                    <item.icon size={20} />
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    search={
                      item.path === "/"
                        ? { period: "day", page: 1 }
                        : item.path === "/tv"
                          ? { period: "day", page: 1 }
                          : item.path === "/people"
                            ? { page: 1 }
                            : undefined
                    }
                    aria-label={item.label}
                    className={`p-2 rounded-lg transition-all ${
                      isActive(item.path)
                        ? "text-blue-400 bg-blue-900/20"
                        : "text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
                    tabIndex={0}>
                    <item.icon size={20} />
                  </Link>
                )}
                {/* Tooltip */}
                <span className="absolute left-full ml-4 px-2 py-1 rounded-md bg-gray-800 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
                  {item.label}
                </span>
              </div>
            ))}
          </nav>
        </div>
        {/* User Section (bottom) */}
        <div className="p-4 border-t border-gray-800">
          {!loading && user ? (
            <div className="relative group flex flex-col items-center">
              <Link
                to="/auth/profile"
                aria-label="Profile"
                className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                <img
                  src={getProfileImage()}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              </Link>
              <span className="absolute left-full ml-4 px-2 py-1 rounded-md bg-gray-800 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
                Profile
              </span>
              <button
                onClick={handleLogout}
                className="mt-2 w-8 h-8 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700 transition-colors"
                aria-label="Logout">
                <LogOut size={16} className="text-white" />
              </button>
            </div>
          ) : (
            <div className="relative group flex justify-center">
              <Link
                to="/auth"
                aria-label="Login"
                className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 hover:text-white transition-colors">
                <LogIn size={16} />
              </Link>
              <span className="absolute left-full ml-4 px-2 py-1 rounded-md bg-gray-800 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
                Login
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 min-w-[300px] max-w-[330px] bg-gray-900/80 backdrop-blur-lg border border-gray-800 z-50 rounded-md">
        <div className="flex justify-around py-3">
          {navItems.map((item) => (
            <div key={item.path} className="flex flex-col items-center">
              {item.action ? (
                <button
                  onClick={item.action}
                  aria-label={item.label}
                  className={`p-2 rounded-lg ${
                    isActive(item.path) ? "text-blue-400" : "text-gray-400"
                  }`}>
                  <item.icon size={20} />
                </button>
              ) : (
                <Link
                  to={item.path}
                  search={
                    item.path === "/"
                      ? { period: "day", page: 1 }
                      : item.path === "/tv"
                        ? { period: "day", page: 1 }
                        : item.path === "/people"
                          ? { page: 1 }
                          : undefined
                  }
                  aria-label={item.label}
                  className={`p-2 rounded-lg ${
                    isActive(item.path) ? "text-blue-400" : "text-gray-400"
                  }`}>
                  <item.icon size={20} />
                </Link>
              )}
              <span className="text-xs mt-1">{item.label}</span>
            </div>
          ))}
          <div className="flex flex-col items-center">
            {!loading && user ? (
              <Link
                to="/auth/profile"
                aria-label="Profile"
                className={`p-2 rounded-lg ${
                  location.pathname.startsWith("/auth/profile")
                    ? "text-blue-400"
                    : "text-gray-400"
                }`}>
                <img
                  src={getProfileImage()}
                  alt="Profile"
                  className="w-7 h-7 rounded-full object-cover border-2 border-blue-400"
                />
              </Link>
            ) : (
              <Link
                to="/auth"
                aria-label="Login"
                className={`p-2 rounded-lg ${
                  location.pathname.startsWith("/auth")
                    ? "text-blue-400"
                    : "text-gray-400"
                }`}>
                <LogIn size={20} />
              </Link>
            )}
            <span className="text-xs mt-1">
              {!loading && user ? "Profile" : "Login"}
            </span>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
