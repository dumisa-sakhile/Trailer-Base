import type { FunctionComponent } from "react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart } from "lucide-react";

const Footer: FunctionComponent = () => {
  const [full, setFull] = useState<string>("Enter Fullscreen");

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      setFull("Exit Fullscreen");
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      setFull("Enter Fullscreen");
      document.exitFullscreen().catch((err) => {
        console.error(`Error attempting to exit fullscreen: ${err.message}`);
      });
    }
  };

  return (
    <footer className="hidden md:block w-full p-4 py-6 lg:py-8">
      <div className="mx-auto max-w-screen-xl">
        <div className="md:flex md:justify-between">
          {/* Left Section - Made By */}
          <div className="mb-6 md:mb-0">
            <span className="flex items-center gap-2 capitalize text-sm text-gray-200">
              Made with{" "}
              <Heart className="text-blue-500 text-lg" aria-label="love" />
              by{" "}
              <a
                href="https://www.sakhiledumisa.com/"
                className="hover:font-bold transition-all duration-200"
                target="_blank"
                rel="noopener noreferrer">
                Sakhile Dumisa
              </a>
            </span>
          </div>

          {/* Right Section - Links */}
          <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
            <div>
              <h2 className="mb-6 text-sm text-white uppercase">Resources</h2>
              <ul className="text-gray-200 font-light">
                <li className="mb-4">
                  <a
                    href="https://developer.themoviedb.org/docs/getting-started"
                    className="hover:font-bold transition-all duration-200"
                    target="_blank"
                    rel="noopener noreferrer">
                    TMDB API
                  </a>
                </li>
                <li>
                  <a
                    href="https://tanstack.com/"
                    className="hover:font-bold transition-all duration-200"
                    target="_blank"
                    rel="noopener noreferrer">
                    Tanstack
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm text-white uppercase">Follow us</h2>
              <ul className="text-gray-200 font-light">
                <li className="mb-4">
                  <a
                    href="https://github.com/dumisa-sakhile"
                    className="hover:font-bold transition-all duration-200"
                    target="_blank"
                    rel="noopener noreferrer">
                    Github
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com/in/sakhile-dumisa/"
                    className="hover:font-bold transition-all duration-200"
                    target="_blank"
                    rel="noopener noreferrer">
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm text-white uppercase">Settings</h2>
              <ul className="text-gray-200 font-light">
                <li
                  className="hover:font-medium cursor-pointer transition-all duration-200"
                  id="fullscreen"
                  onClick={toggleFullscreen}>
                  {full}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <hr className="my-6 border-neutral-700 sm:mx-auto lg:my-8" />

        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-200 sm:text-center">
            © {new Date().getFullYear()}{" "}
            <Link
              to="/"
              search={{ period: "day", page: 1 }}
              className="hover:font-bold transition-all duration-200">
              Trailer Base
            </Link>
            . All Rights Reserved.
          </span>
          <div className="flex mt-4 sm:justify-center sm:mt-0">
            <img
              src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_long_1-8ba2ac31f354005783fab473602c34c3f4fd207150182061e425d366e4f34596.svg"
              alt="TMDB"
              className="w-[100px]"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
