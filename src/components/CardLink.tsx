import React from "react";
import { Link } from "@tanstack/react-router";

interface CardLinkProps {
  to: string;
  params: Record<string, any>;
  imageUrl: string;
  title: string;
  description?: string;
}

const CardLink: React.FC<CardLinkProps> = ({
  to,
  params,
  imageUrl,
  title,
  description = "",
}) => {
  return (
    <Link
      to={to}
      params={params}
      className="w-[300px] h-[450px] sm:w-[300px] sm:h-[450px] max-sm:w-[220px] max-sm:h-[360px]
        flex-none rounded-lg shadow-md flex items-center justify-center relative group
        hover:scale-95 transition-transform duration-300 ease-in-out overflow-hidden
        geist-light hover:ring-1 hover:ring-black hover:rotate-3">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover rounded-lg overflow-hidden"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black transition-opacity flex flex-col justify-end p-4 rounded-lg">
        <h3 className="text-white text-lg sm:text-lg max-sm:text-base roboto-condensed-bold">
          {title}
        </h3>
        <p className="text-white text-sm max-sm:text-xs roboto-condensed-light">
          {description}
        </p>
      </div>
    </Link>
  );
};

export default CardLink;
