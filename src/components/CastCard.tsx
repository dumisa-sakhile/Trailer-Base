import React from "react";
import { Link } from "@tanstack/react-router";

interface CastCardProps {
  id: number;
  name: string;
  profile_path?: string;
  character: string;
}

const CastCard: React.FC<CastCardProps> = ({
  id,
  name,
  profile_path,
  character,
}) => {
  return (
    <Link
      to="/people/$personId"
      params={{ personId: String(id) }}
      key={id}
      className="flex flex-col items-center text-center rounded-lg p-4 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95 w-48">
      <img
        src={
          profile_path
            ? `https://image.tmdb.org/t/p/w185/${profile_path}`
            : "https://novalin.se/wp-content/uploads/2020/03/Sveagarden-1010-.jpg"
        }
        alt={name}
        className="w-24 h-24 rounded-full object-cover mb-2"
      />
      <h3 className="text-white text-md roboto-condensed-light capitalize">
        {name}
      </h3>
      <p className="text-gray-400 text-sm">{character}</p>
    </Link>
  );
};

export default CastCard;
