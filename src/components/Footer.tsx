import type {FunctionComponent} from "react";
import {Link} from "@tanstack/react-router";

const Footer: FunctionComponent = () => {
  return (
    <footer className="bg-gray-950/70 backdrop-blur-lg text-base text-gray-300 rounded-lg shadow-xl mx-auto my-8 p-6 max-w-[calc(100vw-4vw)] md:max-w-[1100px] border border-gray-800/50 ">
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Left Section - Copyright */}
        <div className="text-sm text-gray-400 whitespace-nowrap text-center md:text-left">
          &copy; {new Date().getFullYear()}{" "}
          <Link to="/" search={{ period: "day" ,page: 1}}
            className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-semibold">
            Trailer Base
          </Link>
          . All Rights Reserved.
        </div>

        {/* Center Section - Made By */}
        <div className="text-sm text-gray-400 whitespace-nowrap text-center">
          Made with{" "}
          <span className="text-red-500 animate-pulse" aria-label="love">
            &hearts;
          </span>{" "}
          by{" "}
          <a
            href="https://sakhile-dumisa.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-semibold">
            Dumisa Sakhile
          </a>
        </div>

        {/* Right Section - External Links */}
        <div className="flex justify-center md:justify-end">
          <ul className="flex flex-wrap items-center justify-center text-sm font-medium text-gray-400 space-x-6">
            <li>
              <a
                href="https://github.com/dumisa-sakhile"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-300 transition-colors duration-200 whitespace-nowrap">
                GitHub
              </a>
            </li>
            <li>
              <a
                href="https://www.themoviedb.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-300 transition-colors duration-200 whitespace-nowrap">
                TMDb API
              </a>
            </li>
            <li>
              <a
                href="https://tanstack.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-300 transition-colors duration-200 whitespace-nowrap">
                Tanstack
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
