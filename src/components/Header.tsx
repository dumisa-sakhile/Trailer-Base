import { Link } from '@tanstack/react-router';
import React from 'react';
import logo from '../logo.svg';
import Button from './Button';


const Header: React.FC = () => {
  return (
    <header className="gap-4 items-center justify-center fixed top-0 left-0 w-full h-[70px] shadow  flex flex-wrap md:grid md:grid-cols-3 bg-black md:px-32 py-4 z-10">
      <nav className="flex items-center gap-4 text-sm geist-light">
        <Link to="/">
          <img src={logo} alt="logo" className="w-12 h-12" />
        </Link>
        <Link to="/">Movies</Link>
        <Link to="/tv">TV</Link>
        <Link to="/people">People</Link>
      </nav>
      <nav className="flex items-center">
        <input
          type="search"
          name="search"
          id=""
          placeholder="Search a Movie, TV show..."
          className="p-2 rounded-full h-[48px] w-[300px] md:w-full bg-[#131313] text-white pl-8 outline-none roboto-condensed-light text-sm ring-1 ring-gray-800 focus:ring-[#131313] transition-all duration-300 ease-in-out"
        />
      </nav>
      <nav className="hidden md:flex items-center justify-end gap-4">
       
        <Button variant="primary">
          Sign Up
        </Button>
      </nav>
    </header>
  );
}

export default Header