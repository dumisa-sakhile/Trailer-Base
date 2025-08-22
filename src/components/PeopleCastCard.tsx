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
}) => (
  <Link
    to="/people/$personId"
    params={{ personId: String(id) }}
    key={id}
    className="flex flex-col items-center text-center p-2 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95 w-36"
    style={{ minWidth: 144 }}>
    <img
      src={
        profile_path
          ? `https://image.tmdb.org/t/p/w185/${profile_path}`
          : import.meta.env.VITE_PERSON_PLACEHOLDER
      }
      alt={name}
      className="w-20 h-20 rounded-full object-cover mb-2"
    />
    <h3 className="text-white text-sm  capitalize">{name}</h3>
    <p className="text-gray-400 text-xs">{character}</p>
  </Link>
);

export default CastCard;