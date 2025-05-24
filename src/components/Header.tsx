import { Link, useNavigate } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import logo from "../logo.svg";
import male from "/male.jpg?url"; // Fallback profile image
import female from "/female.jpg?url"; // Fallback profile image
import { useSearchContext } from "@/context/searchContext";
import { auth, db } from "../config/firebase"; // Adjust path as needed
import { onAuthStateChanged, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

// Interface for user data in Firestore
interface UserData {
  gender?: string;
}

const Header: React.FC = () => {
  const { setStatus } = useSearchContext();
  const navigate = useNavigate();

  // State to hold current user info
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch user data (gender) from Firestore
  const { data: userData } = useQuery<UserData>({
    queryKey: ["userData", user?.uid],
    queryFn: async () => {
      if (!user) return {};
      const userDoc = await getDoc(doc(db, "users", user.uid));
      return userDoc.exists() ? (userDoc.data() as UserData) : {};
    },
    enabled: !!user,
  });

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate({ to: "/auth" }); // Redirect to login page after logout
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Determine fallback image based on gender
  const getFallbackImage = () => {
    if (user?.photoURL) return user.photoURL;
    return userData?.gender === "female" ? female : male;
  };

  return (
    <header className="absolute top-0 left-0 bg-black backdrop-blur-md shadow-lg z-20 w-full">
      {/* Mobile Layout */}
      <div className="md:hidden relative min-h-[180px]">
        {/* Profile/Login Section (Top, Absolute) */}
        <div className="absolute top-6 right-6 flex items-center gap-4 z-20">
          {!loading && !user && (
            <Link to="/auth">
              <button
                className="px-4 py-2 bg-[rgba(0,0,0,0.8)] backdrop-blur-lg rounded-lg text-gray-200 font-medium text-base uppercase tracking-wider hover:bg-white hover:text-black hover:shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 shadow-sm border border-gray-700/50"
                aria-label="Login">
                Login
              </button>
            </Link>
          )}
          {!loading && user && (
            <>
              <Link to="/auth/profile" aria-label="Profile">
                <img
                  src={getFallbackImage()}
                  alt={user.displayName || "Profile"}
                  className="w-10 h-10 rounded-full hover:scale-105 transition-transform duration-300 border border-gray-700/50 shadow-sm"
                  title={user.displayName || "Profile"}
                />
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-[rgba(0,0,0,0.8)] backdrop-blur-lg rounded-lg text-gray-200 font-medium text-base uppercase tracking-wider hover:bg-white hover:text-black hover:shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 shadow-sm border border-gray-700/50"
                aria-label="Logout">
                Logout
              </button>
            </>
          )}
        </div>

        {/* Logo (Top-Left, Absolute) */}
        <div className="absolute top-6 left-6 z-20">
          <Link
            to="/"
            search={{ period: "day", page: 1 }}
            className="flex items-center">
            <img
              src={logo}
              alt="Trailer Base Logo"
              className="w-12 h-12 hover:scale-110 transition-transform duration-300"
            />
          </Link>
        </div>

        {/* Search Bar (Below Profile, Absolute) */}
        <div className="absolute top-20 left-0 right-0 mx-6 z-20">
          <nav className="relative">
            <input
              type="search"
              name="search"
              placeholder="Search for TV shows or movies..."
              className="w-full h-10 pl-12 pr-4 bg-[#111] text-gray-200 text-sm roboto-condensed-light rounded-full border border-[#444444]/50 focus:border-[#555555] focus:ring-2 focus:ring-[#555555]/50 outline-none transition-all duration-300 placeholder:text-gray-400 placeholder:font-light shadow-md"
              autoComplete="off"
              onClick={() => setStatus(true)}
            />
            <svg
              className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.5"
                d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
              />
            </svg>
          </nav>
        </div>

        {/* Bottom Text Navigation (Below Search Bar) */}
        <div className="absolute top-36 left-0 right-0 mx-6 z-20">
          <nav className="flex justify-around text-gray-200 text-sm font-medium">
            <Link
              search={{ period: "day", page: 1 }}
              to="/"
              className="hover:text-white transition-all duration-300"
              activeProps={{ className: "text-white underline" }}
              onClick={() =>
                navigate({ to: "/", search: { period: "day", page: 1 } })
              }>
              Movies
            </Link>
            <Link
              search={{ period: "day", page: 1 }}
              to="/tv"
              className="hover:text-white transition-all duration-300"
              activeProps={{ className: "text-white underline" }}
              onClick={() =>
                navigate({ to: "/tv", search: { period: "day", page: 1 } })
              }>
              Shows
            </Link>
            <Link
              to="/people"
              className="hover:text-white transition-all duration-300"
              activeProps={{ className: "text-white underline" }}>
              People
            </Link>
          </nav>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between px-8 py-6 md:px-16 h-[100px]">
        {/* Logo & Navigation */}
        <nav className="flex items-center gap-12">
          <Link
            to="/"
            search={{ period: "day", page: 1 }}
            className="flex items-center">
            <img
              src={logo}
              alt="Trailer Base Logo"
              className="w-14 h-14 hover:scale-110 transition-transform duration-300"
            />
          </Link>
          <div className="flex gap-8 text-gray-200 font-semibold text-lg font-sans">
            <Link
              search={{ period: "day", page: 1 }}
              to="/"
              activeOptions={{ exact: true }}
              className="hover:text-white hover:underline underline-offset-8 transition-all duration-300"
              activeProps={{ className: "text-white underline" }}
              onClick={() =>
                navigate({ to: "/", search: { period: "day", page: 1 } })
              }>
              Movies
            </Link>
            <Link
              search={{ period: "day", page: 1 }}
              to="/tv"
              activeOptions={{ exact: true }}
              className="hover:text-white hover:underline underline-offset-8 transition-all duration-300"
              activeProps={{ className: "text-white underline" }}
              onClick={() =>
                navigate({ to: "/tv", search: { period: "day", page: 1 } })
              }>
              Shows
            </Link>
            <Link
              to="/people"
              className="hover:text-white hover:underline underline-offset-8 transition-all duration-300"
              activeProps={{ className: "text-white underline" }}>
              People
            </Link>
          </div>
        </nav>

        {/* Search */}
        <nav className="flex items-center relative">
          <input
            type="search"
            name="search"
            placeholder="Search for TV shows or movies..."
            className="w-[250px] md:w-[350px] h-10 pl-12 pr-4 bg-[#111] text-gray-200 text-sm roboto-condensed-light rounded-full border border-[#444444]/50 focus:border-[#555555] focus:ring-2 focus:ring-[#555555]/50 outline-none transition-all duration-300 placeholder:text-gray-400 placeholder:font-light shadow-md"
            autoComplete="off"
            onClick={() => setStatus(true)}
          />
          <svg
            className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24">
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.5"
              d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
            />
          </svg>
        </nav>

        {/* Login & Genre */}
        <nav className="flex items-center gap-6">
          <button
            className="flex items-center gap-2 px-5 py-2.5 bg-[rgba(0,0,0,0.8)] backdrop-blur-lg rounded-lg text-gray-200 font-medium text-base uppercase tracking-wider hover:bg-white hover:text-black hover:shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 shadow-sm border border-gray-700/50"
            aria-label="Filter by Genre">
            <svg
              className="w-6 h-6"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.5"
                d="M18.796 4H5.204a1 1 0 0 0-.753 1.659l5.302 6.058a1 1 0 0 1 .247.659v4.874a.5.5 0 0 0 .2.4l3 2.25a.5.5 0 0 0 .8-.4v-7.124a1 1 0 0 1 .247-.659l5.302-6.059c.566-.646.106-1.658-.753-1.658Z"
              />
            </svg>
            Genre
          </button>

          {!loading && !user && (
            <Link to="/auth">
              <button
                className="px-5 py-2.5 bg-[rgba(0,0,0,0.8)] backdrop-blur-lg rounded-lg text-gray-200 font-medium text-base uppercase tracking-wider hover:bg-white hover:text-black hover:shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 shadow-sm border border-gray-700/50"
                aria-label="Login">
                Login
              </button>
            </Link>
          )}

          {!loading && user && (
            <>
              <Link to="/auth/profile" aria-label="Profile">
                <img
                  src={getFallbackImage()}
                  alt={user.displayName || "Profile"}
                  className="w-12 h-12 rounded-full hover:scale-105 transition-transform duration-300 border border-gray-700/50 shadow-sm"
                  title={user.displayName || "Profile"}
                />
              </Link>
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 bg-[rgba(0,0,0,0.8)] backdrop-blur-lg rounded-lg text-gray-200 font-medium text-base uppercase tracking-wider hover:bg-white hover:text-black hover:shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 shadow-sm border border-gray-700/50"
                aria-label="Logout">
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
