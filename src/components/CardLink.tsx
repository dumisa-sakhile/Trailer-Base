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
      className="w-[300px] flex-none h-[450px] rounded-lg shadow-md flex items-center justify-center relative group hover:scale-95 transition-transform duration-300 ease-in-out overflow-hidden geist-light ">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover rounded-lg overflow-hidden"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black transition-opacity flex flex-col justify-end p-4 rounded-lg">
        <h3 className="text-white text-lg font-bold">{title}</h3>
        <p className="text-white text-sm">{description}</p>
      </div>
    </Link>
  );
};

export default CardLink;
