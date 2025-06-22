import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useSearchContext } from "@/context/searchContext";
import { auth, db } from "../config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import male from "/male.jpg?url";
import female from "/female.jpg?url";
import { Search as LucideSearch } from "lucide-react";
import Search from "./Search";

const Header: React.FC = () => {
  const { status, setStatus, setPageType } = useSearchContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ bottom: 0, left: 0 });

  const getPageType = () => {
    if (location.pathname.startsWith("/tv")) return "tv";
    if (location.pathname.startsWith("/people")) return "people";
    return "movies";
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const { data: userData } = useQuery({
    queryKey: ["userData", user?.uid],
    queryFn: async () => {
      if (!user) return {};
      const userDoc = await getDoc(doc(db, "users", user.uid));
      return userDoc.exists() ? userDoc.data() : {};
    },
    enabled: !!user,
  });

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      toast.success("Successfully signed out!");
      navigate({ to: "/auth" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const getFallbackImage = () => {
    if (user?.photoURL) return user.photoURL;
    return userData?.gender === "female" ? female : male;
  };

  const handleSearchClick = () => {
    setPageType(getPageType());
    setStatus(true);
  };

  const getSearchPlaceholder = () => {
    if (location.pathname.startsWith("/tv")) return "The Chosen...";
    if (location.pathname.startsWith("/people")) return "Nomzamo Mbatha...";
    return "The Hobbit...";
  };

  const handleMouseEnter = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      bottom: rect.bottom - 30, // Position above the image
      left: rect.left + rect.width / 2, // Centered horizontally
    });
    setTooltipVisible(true);
  };

  const handleMouseLeave = () => {
    setTooltipVisible(false);
  };

  return (
    <>
      <header className="w-full fixed top-0 left-0 z-50 bg-black text-white px-4 sm:px-6">
        {/* Mobile Nav */}
        <div className="sm:hidden flex flex-col w-full items-center py-2 ">
          <nav className="flex flex-row items-center justify-around w-full gap">
            <div className="flex flex-row items-center gap-4  poppins-light ">
              <Link
                to="/"
                search={{ period: "day", page: 1 }}
                className={`transition ${
                  location.pathname === "/"
                    ? "text-blue-500"
                    : "text-gray-100 hover:text-gray-300"
                }`}>
                Movies
              </Link>
              <Link
                to="/tv"
                search={{ period: "day", page: 1 }}
                className={`transition ${
                  location.pathname.startsWith("/tv")
                    ? "text-blue-500"
                    : "text-gray-100 hover:text-gray-300"
                }`}>
                Shows
              </Link>
              <Link
                to="/people"
                className={`transition ${
                  location.pathname.startsWith("/people")
                    ? "text-blue-500"
                    : "text-gray-100 hover:text-gray-300"
                }`}>
                People
              </Link>
            </div>
            {!loading && !user && (
              <Link to="/auth">
                <button className="text-sm px-6 py-3 bg-blue-600 text-white rounded-md  hover:bg-blue-700">
                  Login
                </button>
              </Link>
            )}
            {!loading && user && (
              <button
                onClick={() => handleLogout()}
                className="ring-1 ring-white/20 bg-[#262626] hover:bg-[#262626]/50 text-white px-6 py-2 rounded-full capitalize transition">
                Logout
              </button>
            )}
          </nav>
          <div className="relative w-full mt-2">
            <LucideSearch
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white z-10"
            />
            <input
              type="search"
              className="poppins-light w-full h-12 pl-14 pr-4 text-base rounded-full bg-[#262626]  text-white placeholder-gray-300  backdrop-blur-md focus:outline-none"
              placeholder={getSearchPlaceholder()}
              onClick={handleSearchClick}
            />
            {!loading && user && (
              <Link
                to="/auth/profile"
                aria-label="Profile"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}>
                <img
                  src={getFallbackImage()}
                  alt={user.displayName || "Profile"}
                  className="w-9 h-9 rounded-full border border-blue-500 object-cover"
                />
              </Link>
            )}
            {tooltipVisible && (
              <div
                className="absolute bg-black text-white text-sm py-1 px-2 rounded-full ring-1 ring-white/20 shadow-lg"
                style={{
                  bottom: tooltipPosition.bottom,
                  left: tooltipPosition.left,
                  transform: "translateX(50%)",
                }}>
                {user?.displayName || "Profile"}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden sm:flex items-center justify-between max-w-7xl mx-auto h-20">
          {/* Left: Logo & Nav */}
          <div className="flex items-center gap-6 text-lg font-bold">
            <nav className="flex items-center gap-5 text-base poppins-light">
              <Link
                to="/"
                search={{ period: "day", page: 1 }}
                className={`transition ${
                  location.pathname === "/"
                    ? "bg-blue-600 text-gray-100"
                    : "bg-[#262626] text-gray-300 hover:text-gray-100 ring-1 ring-white/10"
                } px-4 py-2 rounded-full`}>
                Movies
              </Link>
              <Link
                to="/tv"
                search={{ period: "day", page: 1 }}
                className={`transition ${
                  location.pathname.startsWith("/tv")
                    ? "bg-blue-600 text-gray-100"
                    : "bg-[#262626] text-gray-300 hover:text-gray-100 ring-1 ring-white/10"
                } px-4 py-2 rounded-full`}>
                TV
              </Link>
              <Link
                to="/people"
                className={`transition ${
                  location.pathname.startsWith("/people")
                    ? "bg-blue-600 text-gray-100"
                    : "bg-[#262626] text-gray-300 hover:text-gray-100 ring-1 ring-white/10"
                } px-4 py-2 rounded-full`}>
                People
              </Link>
            </nav>
          </div>

          {/* Center: Search Input */}
          <div className="relative w-[420px]">
            <LucideSearch
              size={22}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 z-10"
            />
            <input
              type="search"
              placeholder={getSearchPlaceholder()}
              className="poppins-light w-full h-12 pl-14 pr-4 rounded-full bg-[#262626] text-base text-white placeholder-gray-300  backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={handleSearchClick}
            />
          </div>

          {/* Right: Auth / Profile */}
          <div className="flex items-center gap-5">
            {!loading && !user && (
              <Link to="/auth">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full text-sm transition">
                  Login
                </button>
              </Link>
            )}
            {!loading && user && (
              <>
                <Link
                  to="/auth/profile"
                  aria-label="Profile"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}>
                  <img
                    src={getFallbackImage()}
                    alt={user.displayName || "Profile"}
                    className="w-10 h-10 rounded-full border border-blue-400 object-cover hover:scale-105 transition-transform"
                  />
                </Link>
                {tooltipVisible && (
                  <div
                    className="absolute bg-black text-white text-sm py-1 px-2 rounded-full ring-1 ring-white/20 shadow-lg"
                    style={{
                      bottom: tooltipPosition.bottom,
                      left: tooltipPosition.left,
                      transform: "translateX(50%)",
                    }}>
                    {user.displayName || "Profile"}
                  </div>
                )}
                <button
                  onClick={() => handleLogout()}
                  className=" ring-1 ring-white/20 bg-[#262626] hover:bg-[#262626]/50 text-white px-6 py-3 rounded-full capitalize transition">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {status && <Search />}
    </>
  );
};

export default Header;