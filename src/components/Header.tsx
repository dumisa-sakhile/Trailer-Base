import { Link, useNavigate } from "@tanstack/react-router";
import React, { useEffect, useState, useRef } from "react";
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
import tvGenres from "@/data/tvGenres"; // Import TV genres data
import movieGenres from "@/data/movieGenres"; // Import Movie genres data

// Interface for user data in Firestore
interface UserData {
  gender?: string;
}

// TV Icon as JSX
const TVIcon = ({ fill }: { fill: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24px"
    viewBox="0 -960 960 960"
    width="24px"
    fill={fill}
  >
    <path d="M400-376.92 623.08-520 400-663.08v286.16ZM360-160v-80H184.62q-27.62 0-46.12-18.5Q120-277 120-304.62v-430.76q0-27.62 18.5-46.12Q157-800 184.62-800h590.76q27.62 0 46.12 18.5Q840-763 840-735.38v430.76q0 27.62-18.5 46.12Q803-240 775.38-240H600v80H360ZM184.62-280h590.76q9.24 0 16.93-7.69 7.69-7.69 7.69-16.93v-430.76q0-9.24-7.69-16.93-7.69-7.69-16.93-7.69H184.62q-9.24 0-16.93 7.69-7.69 7.69-7.69 16.93v430.76q0 9.24 7.69 16.93 7.69 7.69 16.93 7.69ZM160-280v-480 480Z" />
  </svg>
);

// Movie Icon as JSX
const MovieIcon = ({ fill }: { fill: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24px"
    viewBox="0 -960 960 960"
    width="24px"
    fill={fill}
  >
    <path d="M740-667.69q13.15 0 22.73-9.58t9.58-22.73q0-13.15-9.58-22.73T740-732.31q-13.15 0-22.73 9.58T707.69-700q0 13.15 9.58 22.73t22.73 9.58Zm-160 0q13.15 0 22.73-9.58t9.58-22.73q0-13.15-9.58-22.73T580-732.31q-13.15 0-22.73 9.58T547.69-700q0 13.15 9.58 22.73t22.73 9.58Zm-10.77 136h181.54q-3.85-26.54-30.12-43.58T660-592.31q-35.92 0-62.19 17.04-26.27 17.04-28.58 43.58ZM300.18-120q-83.26 0-141.72-58.33Q100-236.67 100-320v-240h400v240q0 83.33-58.28 141.67Q383.44-120 300.18-120Zm-.18-40q66 0 113-47t47-113v-200H140v200q0 66 47 113t113 47Zm360-240q-26.77 0-54.96-7.42-28.19-7.43-46.58-20.73L560-476q21.54 17 46.5 26.5T660-440q66 0 113-47t47-113v-200H500v180h-40v-220h400v240q0 83.33-58.33 141.67Q743.33-400 660-400Zm-440 12.31q13.15 0 22.73-9.58t9.58-22.73q0-13.15-9.58-22.73T220-452.31q-13.15 0-22.73 9.58T187.69-420q0 13.15 9.58 22.73t22.73 9.58Zm160 0q13.15 0 22.73-9.58t9.58-22.73q0-13.15-9.58-22.73T380-452.31q-13.15 0-22.73 9.58T347.69-420q0 13.15 9.58 22.73t22.73 9.58Zm-80 136q35.92 0 62.19-17.04 26.27-17.04 28.58-43.58H209.23q2.31 26.54 28.58 43.58T300-251.69Zm0-88.31Zm360-280Z" />
  </svg>
);

const Header: React.FC = () => {
  const { setStatus } = useSearchContext();
  const navigate = useNavigate();

  // State to hold current user info
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenrePopupOpen, setIsGenrePopupOpen] = useState(false); // State for genre popup
  const [showTVGenres, setShowTVGenres] = useState(true); // State to toggle between TV and Movie genres
  const genreButtonRef = useRef<HTMLButtonElement>(null); // Ref for genre button
  const popupRef = useRef<HTMLDivElement>(null); // Ref for popup

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

  // Handle clicks outside the popup to close it
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

  // Toggle genre popup
  const toggleGenrePopup = () => {
    setIsGenrePopupOpen((prev) => !prev);
  };

  // Toggle between TV and Movie genres
  const toggleGenreType = () => {
    setShowTVGenres((prev) => !prev);
  };

  return (
    <header className="absolute top-0 left-0 bg-black backdrop-blur-md shadow-lg z-20 w-full roboto-condensed-light">
      {/* Mobile Layout */}
      <div className="md:hidden relative min-h-[180px]">
        {/* Profile/Login Section (Top, Absolute) */}
        <div className="absolute top-6 right-6 flex items-center gap-4 z-20">
          {!loading && !user && (
            <Link to="/auth">
              <button
                className="px-4 py-2 bg-[rgba(0,0,0,0.8)] backdrop-blur-lg rounded-lg text-gray-200 text-base capitalize tracking-w Tracking-wider hover:bg-white hover:text-black hover:shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 shadow-sm border border-gray-700/50"
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
                className="px-4 py-2 bg-[rgba(0,0,0,0.8)] backdrop-blur-lg rounded-lg text-gray-200 text-base capitalize tracking-wider hover:bg-white hover:text-black hover:shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 shadow-sm border border-gray-700/50"
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
              className="w-full h-[50px] pl-12 pr-4 bg-[#111] text-gray-200 text-sm roboto-condensed-light rounded-full border border-[#444444]/50 focus:border-[#555555] focus:ring-2 focus:ring-[#555555]/50 outline-none transition-all duration-300 placeholder:text-white placeholder:font-light shadow-md"
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
        <div className="absolute top-40 left-0 right-0 mx-6 z-20">
          <nav className="flex justify-around text-gray-200 text-sm">
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
          <div className="flex gap-8 text-gray-200 text-lg roboto-condensed-light">
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
            className="w-[250px] md:w-[350px] h-10 pl-12 pr-4 bg-[#111] text-gray-200 text-sm roboto-condensed-light rounded-full border border-[#444444]/50 focus:border-[#555555] focus:ring-2 focus:ring-[#555555]/50 outline-none transition-all duration-300 placeholder:text-white placeholder:font-light shadow-md"
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
        <nav className="flex items-center gap-6 relative">
          <button
            ref={genreButtonRef}
            onClick={toggleGenrePopup}
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

          {/* Genre Popup */}
          {isGenrePopupOpen && (
            <div
              ref={popupRef}
              className="absolute top-14 right-0 bg-[#1A1A1A] rounded-2xl shadow-xl p-8 w-[400px] max-h-[600px] overflow-y-auto z-30 transition-all duration-300 ease-in-out ">
              <div className="space-y-6">
                {/* Toggle Buttons */}
                <div className="flex justify-around mb-4">
                  <button
                    onClick={toggleGenreType}
                    className={`px-5 py-2.5 text-sm rounded-full transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none shadow-sm ring-1 ring-white/10  ${
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
                    className={`px-5 py-2.5 text-sm rounded-full transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none shadow-sm ring-1 ring-white/10 ${
                      !showTVGenres
                        ? "bg-white text-black shadow-md"
                        : "bg-transparent text-gray-200 hover:bg-[#333] hover:text-white hover:shadow-md"
                    }`}
                    aria-label="Show Movie Genres">
                    <MovieIcon fill={!showTVGenres ? "#000000" : "#FFFFFF"} />
                    Movies
                  </button>
                </div>

                {/* Genres */}
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
                          className="px-5 py-2.5 text-sm  rounded-full transition-all duration-200 bg-transparent hover:bg-white hover:text-black hover:shadow-md focus:outline-none text-gray-200 shadow-sm ring-1 ring-white/10"
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
                className="px-5 py-2.5 bg-[rgba(0,0,0,0.8)] backdrop-blur-lg rounded-lg text-gray-200 text-base capitalize tracking-wider hover:bg-white hover:text-black hover:shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 shadow-sm border border-gray-700/50"
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
                className="px-5 py-2.5 bg-[rgba(0,0,0,0.8)] backdrop-blur-lg rounded-lg text-gray-200 text-base capitalize tracking-wider hover:bg-white hover:text-black hover:shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 shadow-sm border border-gray-700/50"
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
