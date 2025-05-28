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
      className="w-[260px] h-[390px] sm:w-[260px] sm:h-[390px] max-sm:w-[150px] max-sm:h-[240px]
        flex-none rounded-md shadow-sm flex items-center justify-center relative group
        hover:scale-95 transition-transform duration-300 ease-in-out overflow-hidden
        geist-light hover:ring-1 hover:ring-black hover:rotate-2">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover rounded-md overflow-hidden"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black transition-opacity flex flex-col justify-end p-2 rounded-md max-sm:p-1.5">
        <h3 className="text-white text-sm sm:text-sm max-sm:text-xs roboto-condensed-bold">
          {title}
        </h3>
        <p className="text-white text-[10px] max-sm:text-[8px] roboto-condensed-light">
          {description}
        </p>
      </div>
    </Link>
  );
};

export default CardLink;
