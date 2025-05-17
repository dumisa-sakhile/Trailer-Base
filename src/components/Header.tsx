import { Link } from '@tanstack/react-router';
import React from 'react';
import logo from '../logo.svg';
import Button from './Button';


const Header: React.FC = () => {
  return (
    <header className="gap-4 items-center justify-center absolute top-0 left-0 w-full h-[120px] md:h-[70px] flex flex-wrap md:grid md:grid-cols-3 bg-transparent md:px-32 py-4 z-10">
      <nav className="flex items-center gap-4 text-md geist-regular">
        <Link
          to="/"
          search={{ period: "day", page: 1 }}
          activeProps={{ className: "roboto-condensed-bold" }}>
          <img src={logo} alt="logo" className="w-12 h-12" />
        </Link>
        <Link
          to="/"
          search={{ period: "day", page: 1 }}
          activeProps={{ className: "roboto-condensed-bold" }}>
          Movies
        </Link>
        <Link
          to="/tv"
          search={{ page: 1 }}
          activeProps={{ className: "roboto-condensed-bold" }}>
          Shows
        </Link>
        <Link to="/people">People</Link>
      </nav>
      <nav className="flex items-center">
        <input
          type="search"
          name="search"
          id=""
          placeholder="Search for movies!"
          className="p-2 bg-transparent rounded-full text-white text-sm placeholder:text-sm placeholder:font-semibold backdrop-blur-2xl outline-none active:outline-none  placeholder:text-white h-[48px] w-[300px] pl-14 md:w-full ring-1 ring-white/20  focus:ring-white/50 transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
          autoComplete="off"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute w-5 h-5 text-white  ml-4"
          viewBox="0 0 24 24"
          fill="#fff"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round">
          <circle cx="10" cy="10" r="7" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </nav>
      <nav className="hidden md:flex items-center justify-end gap-4">
        <Link to="/auth">
          <Button variant="primary">Login</Button>
        </Link>
      </nav>
    </header>
  );
}

export default Header