import type { FunctionComponent } from "react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Heart,
  Github,
  Linkedin,
  Maximize2,
  Minimize2,
  ExternalLink,
} from "lucide-react";

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
    <footer className="hidden md:block w-full bg-black border-t border-neutral-800 shadow-inner p-4 py-8">
      <div className="mx-auto max-w-screen-xl">
        <div className="md:flex md:justify-between md:items-center gap-8">
          {/* Left Section - Made By */}
          <div className="mb-6 md:mb-0 flex items-center gap-2 text-gray-300">
            <span className="flex items-center gap-2 text-base">
              Made with{" "}
              <Heart className="text-blue-500" size={18} aria-label="love" />
              by{" "}
              <a
                href="https://www.sakhiledumisa.com/"
                className="hover:underline font-medium"
                target="_blank"
                rel="noopener noreferrer">
                Sakhile Dumisa
                <ExternalLink
                  size={14}
                  className="inline ml-1 -mt-1 opacity-60"
                />
              </a>
            </span>
          </div>

          {/* Right Section - Links */}
          <div className="grid grid-cols-2 gap-8 sm:gap-10 sm:grid-cols-3">
            <div>
              <h2 className="mb-4 text-xs text-white uppercase tracking-widest font-semibold">
                Resources
              </h2>
              <ul className="text-gray-400 font-light space-y-2">
                <li>
                  <a
                    href="https://developer.themoviedb.org/docs/getting-started"
                    className="hover:text-blue-400 flex items-center gap-1"
                    target="_blank"
                    rel="noopener noreferrer">
                    TMDB API{" "}
                    <ExternalLink size={14} className="inline opacity-60" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://tanstack.com/"
                    className="hover:text-blue-400 flex items-center gap-1"
                    target="_blank"
                    rel="noopener noreferrer">
                    Tanstack{" "}
                    <ExternalLink size={14} className="inline opacity-60" />
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-4 text-xs text-white uppercase tracking-widest font-semibold">
                Follow
              </h2>
              <ul className="text-gray-400 font-light space-y-2">
                <li>
                  <a
                    href="https://github.com/dumisa-sakhile"
                    className="hover:text-blue-400 flex items-center gap-2"
                    target="_blank"
                    rel="noopener noreferrer">
                    <Github size={16} /> Github
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com/in/sakhile-dumisa/"
                    className="hover:text-blue-400 flex items-center gap-2"
                    target="_blank"
                    rel="noopener noreferrer">
                    <Linkedin size={16} /> LinkedIn
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-4 text-xs text-white uppercase tracking-widest font-semibold">
                Settings
              </h2>
              <ul className="text-gray-400 font-light space-y-2">
                <li>
                  <button
                    className="flex items-center gap-2 hover:text-blue-400 transition-colors"
                    onClick={toggleFullscreen}>
                    {full ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    {full ? "Exit Fullscreen" : "Enter Fullscreen"}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <hr className="my-8 border-neutral-700" />

        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-400 sm:text-center">
            © {new Date().getFullYear()}{" "}
            <Link
              to="/"
              className="hover:text-blue-400 font-medium transition-colors">
              Trailer Base
            </Link>
            . All Rights Reserved.
          </span>
          <div className="flex mt-4 sm:justify-center sm:mt-0">
            <img
              src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_long_1-8ba2ac31f354005783fab473602c34c3f4fd207150182061e425d366e4f34596.svg"
              alt="TMDB"
              className="w-[110px] opacity-90"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
