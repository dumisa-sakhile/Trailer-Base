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
import { LoginIcon, LogoutIcon, SearchIcon } from "@/components/icons/Icons";
import Search from "./Search";

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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

  const toggleGenre = () => {
    setIsGenrePopupOpen((prev) => !prev);
  };

  const toggleGenreType = (showTV: boolean) => {
    setShowTVGenres(showTV);
  };

  return (
    <>
      <header className="w-full h-auto bg-transparent flex flex-col sm:flex-row items-center  px-4 sm:px-6 fixed top-0 left-0 z-50 roboto-condensed-regular">
        {/* Mobile: Links and Login/Logout, Search with Profile Inside */}
        <div className="sm:hidden flex flex-col w-full">
          <nav className="flex flex-row items-center justify-center gap-2 w-full mt-2">
            <div className="flex flex-row items-center gap-4 text-base">
              <Link
                to="/"
                search={{ period: "day", page: 1 }}
                className={`transition ${
                  location.pathname === "/"
                    ? "font-bold text-white"
                    : "font-normal text-gray-200"
                }`}>
                Movies
              </Link>
              <Link
                to="/tv"
                search={{ period: "day", page: 1 }}
                className={`transition ${
                  location.pathname.startsWith("/tv")
                    ? "font-bold text-white"
                    : "font-normal text-gray-200"
                }`}>
                Shows
              </Link>
              <Link
                to="/people"
                className={`transition ${
                  location.pathname.startsWith("/people")
                    ? "font-bold text-white"
                    : "font-normal text-gray-200"
                }`}>
                People
              </Link>
            </div>
            {!loading && !user && (
              <Link to="/auth">
                <button
                  className="flex items-center gap-2 px-3 py-2 bg-[#333]/50 backdrop-blur-md rounded-lg text-gray-200 text-sm hover:bg-white hover:text-black border border-gray-700/50 transition"
                  aria-label="Login">
                  <LoginIcon fill="currentColor" />
                  Login
                </button>
              </Link>
            )}
            {!loading && user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 bg-[#333]/50 backdrop-blur-md rounded-lg text-gray-200 text-sm hover:bg-white hover:text-black border border-gray-700/50 transition"
                aria-label="Logout">
                <LogoutIcon fill="currentColor" />
                Logout
              </button>
            )}
          </nav>
          <div className="relative flex items-center w-full mt-2">
            <span className="absolute left-2 z-40 pointer-events-none bg-inherit p-2">
              <SearchIcon fill="#fff" />
            </span>
            <input
              type="search"
              placeholder="Search..."
              className="w-full h-12 pl-10 pr-14 bg-[#333]/50 backdrop-blur-md text-base text-gray-100 placeholder-gray-100 rounded-full outline-none focus:outline-none border-none shadow-none"
              style={{
                boxShadow: "none",
                border: "none",
              }}
              onClick={handleSearchClick}
            />
            {!loading && user && (
              <Link
                to="/auth/profile"
                aria-label="Profile"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-40">
                <img
                  src={getFallbackImage()}
                  alt={user.displayName || "Profile"}
                  className="w-8 h-8 rounded-full border border-gray-700 object-cover hover:scale-105 transition-transform duration-300"
                  title={user.displayName || "Profile"}
                />
              </Link>
            )}
          </div>
        </div>

        {/* Desktop: Logo, Navigation, Search, Profile/Login */}
        <div className="hidden sm:flex items-center justify-between w-full mt-4   rounded-full">
          <div className="flex items-center gap-8 lg:gap-12 flex-shrink-0">
            <Link
              to="/"
              search={{ period: "day", page: 1 }}
              className="text-xl font-extrabold  tracking-wide text-white select-none">
              Trailer Base
            </Link>
            <nav className="flex flex-row items-center gap-4 sm:gap-6 text-base bg-[#333]/50 backdrop-blur-md px-4 rounded-full">
              <Link
                to="/"
                search={{ period: "day", page: 1 }}
                className={`transition ${
                  location.pathname === "/"
                    ? "font-bold text-white"
                    : "font-normal text-gray-200"
                }`}>
                Movies
              </Link>
              <Link
                to="/tv"
                search={{ period: "day", page: 1 }}
                className={`transition ${
                  location.pathname.startsWith("/tv")
                    ? "font-bold text-white"
                    : "font-normal text-gray-200"
                }`}>
                Shows
              </Link>
              <Link
                to="/people"
                className={`transition ${
                  location.pathname.startsWith("/people")
                    ? "font-bold text-white"
                    : "font-normal text-gray-200"
                }`}>
                People
              </Link>
              {/* Genre Dropdown */}
              <div className="relative">
                <button
                  ref={genreButtonRef}
                  onClick={toggleGenre}
                  className="flex items-center gap-2 px-2 py-1 text-gray-200 hover:text-white transition bg-transparent"
                  aria-label="Filter by Genre"
                  aria-expanded={isGenrePopupOpen}>
                  Genre
                  <svg
                    className={`w-4 h-4 transition ${
                      isGenrePopupOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {isGenrePopupOpen && (
                  <div
                    ref={popupRef}
                    className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 top-10 bg-[#333]/90 backdrop-blur-sm text-md text-white rounded-xl lg:rounded-lg shadow-xl p-5 w-[80vw] max-w-[90vw] sm:w-[500px] max-h-[60vh] overflow-y-auto z-30 geist-light">
                    <div className="flex">
                      <div className="flex flex-col gap-2 w-1/3 pr-4 border-r border-white/10 ">
                        <button
                          onClick={() => toggleGenreType(false)}
                          className={`px-2 py-2 text-sm rounded-full transition focus:outline-none ${!showTVGenres ? "bg-[#007BFF]  " : "bg-transparent text-[#A0A0C0] hover:bg-[#2A2A44]/50 hover:text-white"}`}
                          aria-label="Show Movie Genres">
                          Movies
                        </button>
                        <button
                          onClick={() => toggleGenreType(true)}
                          className={`px-2 py-2 text-sm rounded-full transition focus:outline-none ${showTVGenres ? "bg-[#007BFF]  " : "bg-transparent text-[#A0A0C0] hover:bg-[#2A2A44]/50 hover:text-white"}`}
                          aria-label="Show TV Genres">
                          Series
                        </button>
                      </div>
                      <div className="w-2/3 pl-4">
                        <div className="grid grid-cols-3 gap-2">
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
                                className="px-3 py-2 text-sm rounded-full text-white hover:bg-blue-600  focus:outline-none text-center"
                                onClick={() => {
                                  setIsGenrePopupOpen(false);
                                }}>
                                {genre.name}
                              </Link>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                   
                  </div>
                )}
              </div>
            </nav>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative flex items-center">
              <span className="absolute left-2 z-40 pointer-events-none bg-inherit p-2">
                <SearchIcon fill="#fff" />
              </span>
              <input
                type="search"
                placeholder="Search..."
                className="w-[220px] h-10 pl-10 pr-12 bg-[#333]/50 backdrop-blur-md text-base text-gray-100 placeholder-gray-100 rounded-full outline-none focus:outline-none border-none shadow-none"
                style={{
                  boxShadow: "none",
                  border: "none",
                }}
                onClick={handleSearchClick}
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded bg-[#222] px-1.5 font-mono text-[11px] font-medium text-gray-400 z-40">
                Ctrl K
              </kbd>
            </div>
            {!loading && !user && (
              <Link to="/auth">
                <button
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#333]/50 backdrop-blur-md rounded-lg text-gray-200 text-sm sm:text-base hover:bg-white hover:text-black border border-gray-700/50 transition"
                  aria-label="Login">
                  <LoginIcon fill="currentColor" />
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
                    className="w-8 sm:w-9 h-8 sm:h-9 rounded-full border border-gray-700 object-cover hover:scale-105 transition-transform duration-300"
                    title={user.displayName || "Profile"}
                  />
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#333]/50 backdrop-blur-md rounded-lg text-gray-200 text-sm sm:text-base hover:bg-white hover:text-black border border-gray-700/50 transition"
                  aria-label="Logout">
                  <LogoutIcon fill="currentColor" />
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