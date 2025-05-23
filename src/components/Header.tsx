import { Link, useNavigate } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import logo from "../logo.svg";
import male from "/male.jpg?url"; // fallback profile image
import Button from "./Button";
import { useSearchContext } from "@/context/searchContext";
import { auth } from "../config/firebase"; // Adjust path as needed
import { onAuthStateChanged, signOut } from "firebase/auth";
import type { User } from "firebase/auth";

const Header: React.FC = () => {
  const { setStatus } = useSearchContext();
  const navigate = useNavigate();

  // State to hold current user info
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate({ to: "/auth" }); // Redirect to login page after logout
    } catch (error: any) {
      console.error("Logout error:", error);
      // Optionally show toast or error message here
    }
  };

  return (
    <>
      <header className="gap-4 items-center justify-center absolute top-0 left-0 w-full h-[120px] md:h-[70px] flex flex-wrap md:grid md:grid-cols-3 bg-transparent md:px-32 py-4 z-10">
        {/* logo & nav */}
        <nav className="flex items-center gap-4 text-md geist-regular">
          <Link
            to="/"
            search={{ period: "day", page: 1 }}
            activeProps={{ className: "roboto-condensed-bold" }}>
            <img src={logo} alt="logo" className="w-12 h-12" />
          </Link>
          <Link
            to="/"
            search={{ period: "day", page: 1 }}
            activeProps={{ className: "roboto-condensed-bold" }}>
            Movies
          </Link>
          <Link
            to="/tv"
            search={{ page: 1 }}
            activeProps={{ className: "roboto-condensed-bold" }}>
            Shows
          </Link>
          <Link to="/people">People</Link>
        </nav>

        {/* search */}
        <nav className="flex items-center *:transition *:duration-300 *:ease-in-out *:transform *:hover:scale-105 relative">
          <input
            type="search"
            name="search"
            placeholder="Search for movies!"
            className="p-2 bg-transparent rounded-full text-white text-sm placeholder:text-sm placeholder:font-semibold backdrop-blur-2xl outline-none active:outline-none placeholder:text-white h-[48px] w-[300px] pl-14 md:w-full ring-1 ring-white/20 focus:ring-white/50 shadow-md"
            autoComplete="off"
            onClick={() => setStatus(true)}
          />
          <svg
            className="w-6 h-6 absolute left-4 top-1/2 transform -translate-y-1/2 text-white"
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

        {/* login & genre */}
        <nav className="hidden md:flex items-center justify-end gap-4">
          <button className="text-white text-md roboto-condensed-light capitalize bg-[rgba(39,39,39,0.5)] backdrop-blur-sm rounded h-10 px-4 py-6 flex items-center gap-2 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-105 ring-1 ring-white/20 focus:ring-white/50">
            <svg
              className="w-6 h-6 text-white"
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

            <span className="text-md roboto-condensed-light capitalize">
              Genre
            </span>
          </button>

          {!loading && !user && (
            <Link to="/auth">
              <Button variant="primary">Login</Button>
            </Link>
          )}

          {!loading && user && (
            <>
              <Link to="/auth/profile" aria-label="Profile">
                <img
                  src={user.photoURL || male}
                  alt={user.displayName || "Profile"}
                  className="w-12 h-12 rounded-full hover:scale-95 transition-transform duration-300"
                  title={user.displayName || "Profile"}
                />
              </Link>

              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </nav>
      </header>
    </>
  );
};

export default Header;
