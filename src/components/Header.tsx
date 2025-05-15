import { Link } from '@tanstack/react-router';
import React from 'react';
import logo from '../logo.svg';
import Button from './Button';


const Header: React.FC = () => {
  return (
    <header className="gap-4 items-center justify-center absolute top-0 left-0 w-full h-[70px] flex flex-wrap md:grid md:grid-cols-3 bg-transparent md:px-32 py-4 z-10">
      <nav className="flex items-center gap-4 text-md geist-regular">
        <Link to="/">
          <img src={logo} alt="logo" className="w-12 h-12" />
        </Link>
        <Link to="/">Movies</Link>
        <Link to="/tv">Shows</Link>
        <Link to="/people">People</Link>
      </nav>
      <nav className="flex items-center">
       <input
  type="search"
  name="search"
  id=""
  placeholder="Search for movies!"
  className="p-2 bg-transparent rounded-4xl text-white text-sm placeholder:text-sm placeholder:font-semibold backdrop-blur-2xl focus:outline-none active:outline-none active:rounded-none focus-within:outline-none placeholder:text-white h-[48px] w-[300px] pl-8 md:w-full"
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