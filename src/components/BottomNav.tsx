import { Link, useNavigate } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { auth } from "../config/firebase"; // Adjust path as needed
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
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

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[rgba(0,0,0,0.9)] backdrop-blur-lg border-t border-gray-700/50 z-30 shadow-lg">
      <div className="flex justify-around items-center px-4 py-2">
        {/* Movies */}
        <Link
          search={{ period: "day", page: 1 }}
          to="/"
          activeOptions={{ exact: true }}
          activeProps={{ className: "bg-gray-700/50 text-white" }}
          className="flex flex-col items-center p-4 rounded-xl text-gray-200 font-medium text-xs uppercase tracking-wider transition-all duration-300 ease-in-out hover:bg-white hover:text-black hover:shadow-md hover:scale-105"
          onClick={() =>
            navigate({ to: "/", search: { period: "day", page: 1 } })
          }
          aria-label="Go to Movies">
          <svg
            className="w-7 h-7 mb-1"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24">
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm2 4h10v10H7V7zm2 2v6h6V9H9z"
            />
          </svg>
          Movies
        </Link>

        {/* Shows */}
        <Link
          search={{ period: "day", page: 1 }}
          to="/tv"
          activeOptions={{ exact: true }}
          activeProps={{ className: "bg-gray-700/50 text-white" }}
          className="flex flex-col items-center p-4 rounded-xl text-gray-200 font-medium text-xs uppercase tracking-wider transition-all duration-300 ease-in-out hover:bg-white hover:text-black hover:shadow-md hover:scale-105"
          onClick={() =>
            navigate({ to: "/tv", search: { period: "day", page: 1 } })
          }
          aria-label="Go to Shows">
          <svg
            className="w-7 h-7 mb-1"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24">
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M19 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm-7 12l-4-4 4-4m4 8V8"
            />
          </svg>
          Shows
        </Link>

        {/* People */}
        <Link
          to="/people"
          activeOptions={{ exact: true }}
          activeProps={{ className: "bg-gray-700/50 text-white" }}
          className="flex flex-col items-center p-4 rounded-xl text-gray-200 font-medium text-xs uppercase tracking-wider transition-all duration-300 ease-in-out hover:bg-white hover:text-black hover:shadow-md hover:scale-105"
          aria-label="Go to People">
          <svg
            className="w-7 h-7 mb-1"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24">
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
            />
          </svg>
          People
        </Link>

        {/* Profile/Login */}
        <Link
          to={user ? "/auth/profile" : "/auth"}
          activeOptions={{ exact: true }}
          activeProps={{ className: "bg-gray-700/50 text-white" }}
          className="flex flex-col items-center justify-center p-4 rounded-xl text-gray-200 font-medium text-xs uppercase tracking-wider transition-all duration-300 ease-in-out hover:bg-white hover:text-black hover:shadow-md hover:scale-105"
          aria-label={user ? "Go to Profile" : "Go to Login"}>
          <svg
            className="w-7 h-7 mb-1"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24">
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 7v-2c0-2.66 5.33-4 8-4s8 1.34 8 4v2"
            />
          </svg>
          <span className="flex items-center justify-center w-full">
            {loading ? (
              <span className="animate-pulse text-gray-400">...</span>
            ) : user ? (
              "Profile"
            ) : (
              "Login"
            )}
          </span>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNav;
