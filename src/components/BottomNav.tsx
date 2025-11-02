import { Link, useNavigate } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { auth } from "../config/firebase"; // Adjust path as needed
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { Film, Tv, Users, User as UserIcon } from "lucide-react";

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
          <Film size={28} className="mb-1" />
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
          <Tv size={28} className="mb-1" />
          Shows
        </Link>

        {/* People */}
        <Link
          to="/people"
          activeOptions={{ exact: true }}
          activeProps={{ className: "bg-gray-700/50 text-white" }}
          className="flex flex-col items-center p-4 rounded-xl text-gray-200 font-medium text-xs uppercase tracking-wider transition-all duration-300 ease-in-out hover:bg-white hover:text-black hover:shadow-md hover:scale-105"
          aria-label="Go to People">
          <Users size={28} className="mb-1" />
          People
        </Link>

        {/* Profile/Login */}
        <Link
          to={user ? "/profile" : "/"}
          activeOptions={{ exact: true }}
          activeProps={{ className: "bg-gray-700/50 text-white" }}
          className="flex flex-col items-center justify-center p-4 rounded-xl text-gray-200 font-medium text-xs uppercase tracking-wider transition-all duration-300 ease-in-out hover:bg-white hover:text-black hover:shadow-md hover:scale-105"
          aria-label={user ? "Go to Profile" : "Go to Login"}>
          <UserIcon size={28} className="mb-1" />
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
