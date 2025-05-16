import { Link } from '@tanstack/react-router';
import React from 'react';
import logo from '../logo.svg';
import Button from './Button';


const Header: React.FC = () => {
  return (
    <header className="gap-4 items-center justify-center absolute top-0 left-0 w-full h-[120px] md:h-[70px] flex flex-wrap md:grid md:grid-cols-3 bg-transparent md:px-32 py-4 z-10">
      <nav className="flex items-center gap-4 text-md geist-regular">
        <Link to="/" search={{ period: "day", page: 1 }}>
          <img src={logo} alt="logo" className="w-12 h-12" />
        </Link>
        <Link to="/" search={{ period: "day", page: 1 }}>
          Movies
        </Link>
        <Link to="/tv">Shows</Link>
        <Link to="/people">People</Link>
      </nav>
      <nav className="flex items-center">
        <input
          type="search"
          name="search"
          id=""
          placeholder="Search for movies!"
          className="p-2 bg-transparent rounded-full text-white text-sm placeholder:text-sm placeholder:font-semibold backdrop-blur-2xl outline-none active:outline-none  placeholder:text-white h-[48px] w-[300px] pl-8 md:w-full ring-1 ring-white/20  focus:ring-white/50 transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
          autoComplete="off"
        />
      </nav>
      <nav className="hidden md:flex items-center justify-end gap-4">
        <Button variant="primary">Sign Up</Button>
      </nav>
    </header>
  );
}

export default Header