import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import React, { useEffect, useState, useRef } from "react";
import { useSearchContext } from "@/context/searchContext";
import { auth, db } from "../config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import tvGenres from "@/data/tvGenres";
import movieGenres from "@/data/movieGenres";
import male from "/male.jpg?url";
import female from "/female.jpg?url";
import logo from "./../logo.svg";
import {
  TVIcon,
  LoginIcon,
  LogoutIcon,
  MovieIcon,
  SearchIcon,
} from "@/components/icons/Icons";
import Search from "./Search";

interface UserData {
  gender?: string;
}

const Header: React.FC = () => {
  const { status, setStatus, setPageType } = useSearchContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenrePopupOpen, setIsGenrePopupOpen] = useState(false);
  const [showTVGenres, setShowTVGenres] = useState(true);
  const genreButtonRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Determine pageType based on current route
  const getPageType = () => {
    if (location.pathname.startsWith("/tv")) return "tv";
    if (location.pathname.startsWith("/people")) return "people";
    return "movies"; // Default to movies for main page
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const { data: userData } = useQuery<UserData>({
    queryKey: ["userData", user?.uid],
    queryFn: async () => {
      if (!user) return {};
      const userDoc = await getDoc(doc(db, "users", user.uid));
      return userDoc.exists() ? userDoc.data() : {};
    },
    enabled: !!user,
  });

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        genreButtonRef.current &&
        !genreButtonRef.current.contains(event.target as Node)
      ) {
        setIsGenrePopupOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate({ to: "/auth" });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getFallbackImage = () => {
    if (user?.photoURL) return user.photoURL;
    return userData?.gender === "female" ? female : male;
  };

  const toggleGenre = () => {
    setIsGenrePopupOpen(!isGenrePopupOpen);
  };

  const toggleGenreType = () => {
    setShowTVGenres(!showTVGenres);
  };

  const handleSearchClick = () => {
    setPageType(getPageType()); // Set pageType in context
    setStatus(true); // Open the modal
  };

  return (
    <>
      <header className="fixed top-0 left-0 bg-black backdrop-blur-md shadow-lg z-20 w-full roboto-condensed">
        {/* Mobile Layout */}
        <div className="md:hidden relative min-h-[110px]">
          <div className="absolute top-4 left-0 right-0 flex items-center justify-center">
            <nav className="flex items-center gap-4 text-sm text-gray-200">
              <Link
                to="/"
                search={{ period: "day", page: 1 }}
                className="hover:text-white transition-all duration-300"
                activeProps={{ className: "text-white underline" }}
                onClick={() =>
                  navigate({ to: "/", search: { period: "day", page: 1 } })
                }>
                Movies
              </Link>
              <Link
                to="/tv"
                search={{ period: "day", page: 1 }}
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
              {!loading && !user && (
                <Link to="/auth">
                  <button
                    className="flex items-center justify-center gap-1 px-3 py-1.5 w-20 h-8 bg-white text-black rounded-lg text-sm font-semibold hover:bg-gray-200 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-sm border border-gray-700/20"
                    aria-label="Login">
                    <LoginIcon fill="#000000" />
                    Login
                  </button>
                </Link>
              )}
              {!loading && user && (
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-1 px-3 py-1.5 w-20 h-8 bg-white text-black rounded-lg text-sm font-semibold hover:bg-gray-200 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-sm border border-gray-700/20"
                  aria-label="Logout">
                  <LogoutIcon fill="#000000" />
                  Logout
                </button>
              )}
            </nav>
          </div>
          <div className="absolute top-14 left-0 right-0 mx-4 z-10">
            <nav className="relative">
              <input
                type="search"
                name="search"
                placeholder={`Search for ${getPageType()}...`}
                className="w-full h-12 pl-12 pr-16 bg-[#111] text-gray-200 text-sm roboto-condensed rounded-full border border-[#444444]/50 focus:border-[#555555] focus:ring-2 focus:ring-[#555555]/50 outline-none transition-all duration-300 placeholder:text-gray-400 placeholder:font-light shadow-md"
                autoComplete="off"
                onClick={handleSearchClick}
              />
              <SearchIcon fill="#D1D5DB" />
              {!loading && user && (
                <Link
                  to="/auth/profile"
                  aria-label="Profile"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <img
                    src={getFallbackImage()}
                    alt={user.displayName || "Profile"}
                    className="w-8 h-8 rounded-full hover:scale-110 transition-all duration-300 border border-gray-700/20 shadow-sm"
                    title={user.displayName || "User"}
                  />
                </Link>
              )}
            </nav>
          </div>
        </div>
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between px-8 py-6 md:px-16 h-[100px]">
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
            <div className="flex gap-8 text-gray-200 text-lg roboto-condensed">
              <Link
                to="/"
                search={{ period: "day", page: 1 }}
                activeOptions={{ exact: true }}
                className="hover:text-white hover:underline underline-offset-8 transition-all duration-300"
                activeProps={{ className: "text-white underline" }}
                onClick={() =>
                  navigate({ to: "/", search: { period: "day", page: 1 } })
                }>
                Movies
              </Link>
              <Link
                to="/tv"
                search={{ period: "day", page: 1 }}
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
          <nav className="flex items-center relative">
            <input
              type="search"
              name="search"
              placeholder={`Search for ${getPageType()}...`}
              className="w-[250px] md:w-[350px] h-10 pl-12 pr-6 bg-[#111] text-gray-200 text-sm roboto-condensed rounded-full border border-[#444444]/50 focus:border-[#555555] focus:ring-2 focus:ring-[#555555]/50 outline-none transition-all duration-300 placeholder:text-gray-400 placeholder:font-light shadow-md"
              autoComplete="off"
              onClick={handleSearchClick}
            />
            <SearchIcon fill="#D1D5DB" />
          </nav>
          <nav className="flex items-center gap-6 relative">
            <button
              ref={genreButtonRef}
              onClick={toggleGenre}
              className="flex items-center gap-2 px-5 py-2.5 bg-[rgba(0,0,0,0.8)] backdrop-blur-lg rounded-lg text-gray-200 text-base capitalize tracking-wider hover:bg-white hover:text-black hover:shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 shadow-sm border border-gray-700/50"
              aria-label="Filter by Genre"
              aria-expanded={isGenrePopupOpen}>
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
            {isGenrePopupOpen && (
              <div
                ref={popupRef}
                className="absolute top-14 right-0 bg-[#1A1A1A] rounded-2xl shadow-xl p-8 w-[400px] max-h-[600px] overflow-y-auto z-30 transition-all duration-300 ease-in-out">
                <div className="space-y-6">
                  <div className="flex justify-around mb-4">
                    <button
                      onClick={toggleGenreType}
                      className={`px-5 py-2.5 text-sm max-sm:text-xs rounded-full transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none shadow-sm ring-1 ring-white/10 ${
                        showTVGenres
                          ? "bg-white text-black shadow-md"
                          : "bg-transparent text-gray-200 hover:bg-[#333] hover:text-white hover:shadow-md"
                      }`}
                      aria-label="Show TV Genres">
                      <TVIcon fill={showTVGenres ? "#000000" : "#FFFFFF"} />
                      TV Shows
                    </button>
                    <button
                      onClick={toggleGenreType}
                      className={`px-5 py-2.5 text-sm max-sm:text-xs rounded-full transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none shadow-sm ring-1 ring-white/10 ${
                        !showTVGenres
                          ? "bg-white text-black shadow-md"
                          : "bg-transparent text-gray-200 hover:bg-[#333] hover:text-white hover:shadow-md"
                      }`}
                      aria-label="Show Movie Genres">
                      <MovieIcon fill={!showTVGenres ? "#000000" : "#FFFFFF"} />
                      Movies
                    </button>
                  </div>
                  <div>
                    <br />
                    <div className="flex flex-wrap gap-4 items-center justify-start">
                      {(showTVGenres ? tvGenres() : movieGenres()).map(
                        (genre) => (
                          <Link
                            key={genre.id}
                            to={`/${showTVGenres ? "tv" : "movie"}/$type/$typeName/$typeId`}
                            params={{
                              type: "with_genres",
                              typeName: genre.name,
                              typeId: String(genre.id),
                            }}
                            search={{ page: 1 }}
                            className="px-5 py-2.5 text-sm max-sm:text-xs rounded-full transition-all duration-200 bg-transparent hover:bg-white hover:text-black hover:shadow-md focus:outline-none text-gray-200 shadow-sm ring-1 ring-white/10"
                            onClick={() => setIsGenrePopupOpen(false)}>
                            {genre.name}
                          </Link>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {!loading && !user && (
              <Link to="/auth">
                <button
                  className="flex items-center gap-2 px-5 py-2.5 bg-[rgba(0,0,0,0.8)] backdrop-blur-lg rounded-lg text-gray-200 text-base capitalize tracking-wider hover:bg-white hover:text-black hover:shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 shadow-sm border border-gray-700/50"
                  aria-label="Login">
                  <LoginIcon fill="#D1D5DB" />
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
                  className="flex items-center gap-2 px-5 py-2.5 bg-[rgba(0,0,0,0.8)] backdrop-blur-lg rounded-lg text-gray-200 text-base capitalize tracking-wider hover:bg-white hover:text-black hover:shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 shadow-sm border border-gray-700/50"
                  aria-label="Logout">
                  <LogoutIcon fill="#D1D5DB" />
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      </header>
      {status && <Search />}
    </>
  );
};

export default Header;
