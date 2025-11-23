import React from "react";
import { useNavigate } from "@tanstack/react-router";

interface Props {
  homePath?: string;
  className?: string;
  backLabel?: string;
  homeLabel?: string;
  profilePath?: string;
}

const BackHomeBtn: React.FC<Props> = ({
  homePath = "/",
  className = "",
  backLabel = "← Back",
  homeLabel = "Home ⌂",
  profilePath = "/profile",
}) => {
  const navigate = useNavigate();

  // resolve home path: if default '/' and we're on a /tv page, use '/tv'
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const resolvedHomePath = homePath === "/" && pathname.startsWith("/tv") ? "/tv" : homePath;

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 ${className}`}>
      <button
        onClick={() => window.history.back()}
        className="px-3 py-2 rounded-lg bg-[#333]/50 text-white text-sm hover:scale-105 transition-all"
        aria-label="Go back"
        title="Go back"
        type="button"
      >
        {backLabel}
      </button>

      <button
        onClick={() => navigate({ to: resolvedHomePath })}
        className="px-3 py-2 rounded-lg bg-[#333]/50 text-white text-sm hover:scale-105 transition-all"
        aria-label="Home"
        title="Home"
        type="button"
      >
        {homeLabel}
      </button>

      <button
        onClick={() => navigate({ to: profilePath })}
        className="px-3 py-2 rounded-lg bg-[#333]/50 text-white text-sm hover:scale-105 transition-all flex items-center gap-2"
        aria-label="Profile"
        title="Profile"
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        Profile
      </button>
    </div>
  );
};

export default BackHomeBtn;
