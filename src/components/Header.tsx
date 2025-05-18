import { Link } from '@tanstack/react-router';
import React from 'react';
import logo from '../logo.svg';
import Button from './Button';
import { useSearchContext } from '@/context/searchContext';


const Header: React.FC = () => {
  const { setStatus } = useSearchContext();
  return (
    <>
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
            onClick={() => setStatus(true)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#FFFFFF"
            className="absolute w-5 h-5 text-white  ml-4">
            <path d="M380-320q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l224 224q11 11 11 28t-11 28q-11 11-28 11t-28-11L532-372q-30 24-69 38t-83 14Zm0-80q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
          </svg>
          
        </nav>
        <nav className="hidden md:flex items-center justify-end gap-4">
          <Link to="/auth">
            <Button variant="primary">Login</Button>
          </Link>
        </nav>
      </header>
    </>
  );
}

export default Header