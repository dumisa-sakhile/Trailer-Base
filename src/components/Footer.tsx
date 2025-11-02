import type { FunctionComponent } from "react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

const Footer: FunctionComponent = () => {
  const [full, setFull] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      setFull(true);
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      setFull(false);
      document.exitFullscreen().catch((err) => {
        console.error(`Error attempting to exit fullscreen: ${err.message}`);
      });
    }
  };

  return (
    <footer className=" w-full  border-t border-neutral-800 p-6 bricolage-grotesque-light">
      <div className="mx-auto max-w-screen-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 mb-8">
          {/* Attribution */}
          <div className="flex items-center gap-2 text-sm text-neutral-400 font-light">
            <span>Made with love by</span>
            <a
              href="https://www.sakhiledumisa.com/"
              className="text-white hover:text-blue-400 font-medium transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Sakhile Dumisa
            </a>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-neutral-400 font-light">
            {/* Resources */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-white">
                Resources
              </h3>
              <ul className="space-y-1">
                <li>
                  <a
                    href="https://developer.themoviedb.org/docs/getting-started"
                    className="hover:text-blue-400 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    TMDB API
                  </a>
                </li>
                <li>
                  <a
                    href="https://tanstack.com/"
                    className="hover:text-blue-400 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    TanStack
                  </a>
                </li>
              </ul>
            </div>

            {/* Follow */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-white">
                Follow
              </h3>
              <ul className="space-y-1">
                <li>
                  <a
                    href="https://github.com/dumisa-sakhile"
                    className="hover:text-blue-400 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com/in/sakhile-dumisa/"
                    className="hover:text-blue-400 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>

            {/* Settings */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-white">
                Settings
              </h3>
              <ul className="space-y-1">
                <li>
                  <button
                    className="hover:text-blue-400 transition-colors text-left font-light"
                    onClick={toggleFullscreen}
                  >
                    {full ? "Exit Fullscreen" : "Enter Fullscreen"}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-neutral-800">
          <span className="text-xs text-neutral-500 font-light">
            © {new Date().getFullYear()}{" "}
            <Link
              to="/"
              className="text-white hover:text-blue-400 font-medium transition-colors"
            >
              Trailer Base
            </Link>
            . All rights reserved.
          </span>
          <div className="flex justify-end">
            <img
              src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_long_1-8ba2ac31f354005783fab473602c34c3f4fd207150182061e425d366e4f34596.svg"
              alt="The Movie Database (TMDB)"
              className="h-5 opacity-80"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;