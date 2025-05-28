import React from "react";
import { Link } from "@tanstack/react-router";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  url: string;
  children: React.ReactNode;
  search?: { period: "day" | "week"; page: number };
}

const LinkTo: React.FC<LinkProps> = ({
  variant = "primary",
  url,
  search,
  children,
}) => {
  const baseClasses = `
    w-32 h-12 max-sm:w-24 max-sm:h-10
    px-8 py-4 max-sm:px-3 max-sm:py-1.5
    text-sm max-sm:text-xs
    geist-bold rounded-full focus:outline-none text-[#131313]
    transition duration-300 ease-in-out transform hover:scale-95
    shadow-md font-semibold  flex items-center justify-center
  `;
  const variantClasses = {
    primary: "bg-white hover:bg-gray-200",
    ghost:
      "bg-transparent text-white hover:bg-[#131313] shadow-lg ring-1 ring-white/20",
    secondary: "bg-gray-500 text-white hover:bg-gray-600",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <Link
      to={url}
      search={search}
      className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </Link>
  );
};

export default LinkTo;
