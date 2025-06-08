import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#333]/50 backdrop-blur-md text-base text-gray-100 rounded-lg shadow-sm m-4 roboto-condensed-regular text-center mx-auto max-w-[1020px]">
      <div className="w-full p-4 md:flex md:items-center md:justify-between">
        <span className="text-sm text-gray-200 sm:text-center">
          © {new Date().getFullYear()}{" "}
          <a href="#" className="hover:underline">
            Trailer Base
          </a>
          . All Rights Reserved.
        </span>
        <span className="text-sm text-gray-200 sm:text-center">
          &nbsp;Made with ❤️ by{" "}
          <a
            href="https://sakhile-dumisa.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline">
            Dumisa Sakhile
          </a>
        </span>
        <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-200 sm:mt-0">
          <li>
            <a
              href="https://github.com/dumisa-sakhile"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline me-4 md:me-6">
              GitHub
            </a>
          </li>
          <li>
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline me-4 md:me-6">
              TMDb API
            </a>
          </li>
          <li>
            <a
              href="https://tanstack.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline me-4 md:me-6">
              TanStack
            </a>
          </li>
          <li>
            <a
              href="https://tailwindcss.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline">
              TailwindCSS
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;