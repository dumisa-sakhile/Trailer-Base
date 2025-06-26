import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useSearchContext } from "@/context/searchContext";
import { auth, db } from "../config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Search, ChevronDown, LinkIcon } from "lucide-react";
import male from "/male.jpg?url";
import female from "/female.jpg?url";
import SearchComponent from "./Search";
import movieGenres from "@/data/movieGenres";
import tvGenres from "@/data/tvGenres";

const Header = () => {
  const { status, setStatus, setPageType } = useSearchContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<import("firebase/auth").User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({
    bottom: 0,
    left: 0,
  });
  const [showGenres, setShowGenres] = useState(false);
  const [genreType, setGenreType] = useState("movie");
  const dropdownRef = useRef(null);

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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      toast.error(errorMessage);
    }
  };

  const getFallbackImage = () =>
    user?.photoURL || (userData?.gender === "female" ? female : male);

  const handleMouseEnter = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      bottom: rect.bottom - 30,
      left: rect.left + rect.width / 2,
    });
    setTooltipVisible(true);
  };
  const handleMouseLeave = () => setTooltipVisible(false);

  const handleSearchClick = () => {
    const path = location.pathname;
    setPageType(
      path.startsWith("/tv")
        ? "tv"
        : path.startsWith("/people")
        ? "people"
        : "movies"
    );
    setStatus(true);
  };

  const genres = genreType === "movie" ? movieGenres() : tvGenres();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        event.target instanceof Node &&
        !(dropdownRef.current as HTMLDivElement).contains(event.target)
      ) {
        setShowGenres(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 z-[9999] w-full backdrop-blur bg-black md:border-b md:border-white/10">
      {/* Mobile Nav */}
      <div className="sm:hidden flex flex-col w-full px-4 py-2">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold">TrailerBase</h1>
          <div className="flex gap-2">
            {!loading && !user && (
              <Link to="/auth">
                <button className="text-sm px-4 py-2 text-white rounded-md bg-white/10 border border-white/10">
                  Login
                </button>
              </Link>
            )}
            {!loading && user && (
              <button
                onClick={handleLogout}
                className="text-sm px-4 py-2 text-white rounded-md bg-white/10 border border-white/10">
                Logout
              </button>
            )}
          </div>
        </div>
        <nav className="flex justify-around text-sm">
          <Link
            to="/"
            search={{ period: "day", page: 1 }}
            className={`text-gray-300 ${
              location.pathname === "/" ? "font-bold" : ""
            }`}>
            Movies
          </Link>
          <Link
            to="/tv"
            search={{ period: "day", page: 1 }}
            className={`text-gray-300 ${
              location.pathname.startsWith("/tv") ? "font-bold" : ""
            }`}>
            TV
          </Link>
          <Link
            to="/people"
            className={`text-gray-300 ${
              location.pathname.startsWith("/people") ? "font-bold" : ""
            }`}>
            People
          </Link>
        </nav>
        <div className="relative mt-3">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            placeholder="Search..."
            onClick={handleSearchClick}
            className="w-full h-10 pl-10 pr-12 rounded-full bg-white/10 text-sm text-white border border-white/10"
          />
          {!loading && user && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Link to="/auth/profile">
                <img
                  src={getFallbackImage()}
                  alt="Profile"
                  className="w-6 h-6 rounded-full border border-blue-400"
                />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Nav */}
      <div className="hidden sm:flex items-center justify-between w-full px-6 h-20 max-w-screen-xl mx-auto">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">TrailerBase</h1>
          <span className="bg-white/10 text-sm px-3 py-1 rounded-full border border-white/10 text-white flex items-center gap-1">
            Powered by TMDB <span className="text-xs">🌟</span>
          </span>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <Link
            to="/"
            search={{ period: "day", page: 1 }}
            className={`px-4 py-2 rounded-full ${
              location.pathname === "/"
                ? "font-bold text-white bg-white/10"
                : "text-gray-300 hover:text-white hover:bg-white/10"
            }`}>
            Movies
          </Link>
          <Link
            to="/tv"
            search={{ period: "day", page: 1 }}
            className={`px-4 py-2 rounded-full ${
              location.pathname.startsWith("/tv")
                ? "font-bold text-white bg-white/10"
                : "text-gray-300 hover:text-white hover:bg-white/10"
            }`}>
            TV
          </Link>
          <Link
            to="/people"
            className={`px-4 py-2 rounded-full ${
              location.pathname.startsWith("/people")
                ? "font-bold text-white bg-white/10"
                : "text-gray-300 hover:text-white hover:bg-white/10"
            }`}>
            People
          </Link>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowGenres(!showGenres)}
              className="flex items-center gap-1 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm">
              Genre{" "}
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  showGenres ? "rotate-180" : ""
                }`}
              />
            </button>
            {showGenres && (
              <div className="absolute right-0 mt-2 w-[420px] bg-black rounded-xl shadow-xl p-4 text-sm z-[1000] border border-white/10">
                <div className="flex justify-center mb-3 rounded-full overflow-hidden ring-1 ring-white/10 w-fit mx-auto bg-white/10 text-white py-2 px-2">
                  <button
                    onClick={() => setGenreType("movie")}
                    className={`px-4 py-1 text-sm ${
                      genreType === "movie"
                        ? "bg-white text-black "
                        : "text-gray-300"
                    }`}>
                    Movies
                  </button>
                  <button
                    onClick={() => setGenreType("tv")}
                    className={`px-6 py-1 text-sm ${
                      genreType === "tv"
                        ? "bg-white text-black "
                        : "text-gray-300"
                    }`}>
                    TV
                  </button>
                </div><br />
                <div className="grid grid-cols-2 gap-2">
                  {genres.map((genre) => (
                    <Link
                      key={genre.id}
                      to={
                        genreType === "movie"
                          ? "/movie/$type/$typeName/$typeId"
                          : "/tv/$type/$typeName/$typeId"
                      }
                      params={{
                        type: "with_genres",
                        typeName: genre.name,
                        typeId: String(genre.id),
                      }}
                      search={{ page: 1 }}
                      className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/5 text-white text-xs font-light hover:font-bold">
                      <LinkIcon size={14} /> {genre.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
            />
            <input
              type="search"
              placeholder="Search..."
              onClick={handleSearchClick}
              className="w-full h-10 pl-10 pr-3 rounded-full bg-white/10 text-sm text-white border border-white/10"
            />
          </div>
          {!loading && !user && (
            <Link to="/auth">
              <button className="text-sm px-5 py-2 rounded-full bg-white/10 border border-white/10 text-white">
                Login
              </button>
            </Link>
          )}
          {!loading && user && (
            <>
              <Link
                to="/auth/profile"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="relative">
                <img
                  src={getFallbackImage()}
                  alt="Profile"
                  className="w-9 h-9 rounded-full border border-blue-400 object-cover"
                />
                {tooltipVisible && (
                  <div
                    className="absolute bg-black text-white text-xs py-1 px-2 rounded-full ring-1 ring-white/20 shadow-xl"
                    style={{
                      bottom: tooltipPosition.bottom,
                      left: tooltipPosition.left,
                      transform: "translateX(50%)",
                    }}>
                    {user.displayName || "Profile"}
                  </div>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="ring-1 ring-white/20 bg-white/10 text-white px-4 py-2 rounded-full text-sm border border-white/10">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
      {status && <SearchComponent />}
    </header>
  );
};

export default Header;