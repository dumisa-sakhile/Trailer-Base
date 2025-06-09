import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#333]/50 backdrop-blur-md text-base text-gray-100 rounded-lg shadow-sm m-4 roboto-condensed-light md:geist-regular text-center mx-auto max-w-full md:max-w-[1100px]">
      <div className="w-full p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Left Section */}
        <div className="text-sm text-gray-200 whitespace-nowrap md:text-left">
          © {new Date().getFullYear()}{" "}
          <a href="#" className="hover:text-blue-500">
            Trailer Base
          </a>
          . All Rights Reserved.
        </div>
        {/* Center Section */}
        <div className="text-sm text-gray-200 whitespace-nowrap md:text-center">
          Made with ❤️ by{" "}
          <a
            href="https://sakhile-dumisa.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-500">
            Dumisa Sakhile
          </a>
        </div>
        {/* Right Section */}
        <div className="flex justify-center md:justify-end">
          <ul className="flex flex-wrap items-center justify-center text-sm font-medium text-gray-200 space-x-4 md:space-x-6">
            <li>
              <a
                href="https://github.com/dumisa-sakhile"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-500 whitespace-nowrap">
                GitHub
              </a>
            </li>
            <li>
              <a
                href="https://www.themoviedb.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-500 whitespace-nowrap">
                TMDb API
              </a>
            </li>
            <li>
              <a
                href="https://tanstack.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-500 whitespace-nowrap">
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