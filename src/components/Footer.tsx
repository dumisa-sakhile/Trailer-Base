import React from "react";

const Footer = () => {
  return (
    <footer className="w-full md:w-[900px] text-white text-md roboto-condensed-light capitalize bg-[rgba(39,39,39,0.5)] backdrop-blur-sm rounded-full h-10 px-4 py-6 flex items-center gap-2 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95">
      <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
        <span className="text-sm text-white sm:text-center ro">
          © 2023{" "}
          <a
            href="https://trailer-base.vercel.app"
            target="_blank"
            className="hover:underline roboto-condensed-light">
            Trailer Base™
          </a>
          . All Rights Reserved.
        </span>
        <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-white ro sm:mt-0">
          <li>
            <a
              href="#"
              target="_blank"
              className="hover:underline me-4 md:me-6">
              About
            </a>
          </li>
          <li>
            <a
              href="#"
              target="_blank"
              className="hover:underline me-4 md:me-6">
              Privacy Policy
            </a>
          </li>
          <li>
            <a
              href="#"
              target="_blank"
              className="hover:underline me-4 md:me-6">
              Licensing
            </a>
          </li>
          <li>
            <a href="#" target="_blank" className="hover:underline">
              Contact
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
