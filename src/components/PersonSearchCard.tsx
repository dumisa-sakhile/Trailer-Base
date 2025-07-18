// src/components/PersonSearchCard.tsx
import React, { useState } from "react";
import { Link } from "@tanstack/react-router";

interface PersonSearchCardProps {
  id: string; // Use string as we're likely getting it as string from TMDB or converting
  name: string; // The person's name
  profile_path: string | null; // The path to their profile image
  url: string; // The full URL for the Link component (e.g., /person/$personId)
}

const PersonSearchCard: React.FC<PersonSearchCardProps> = ({
  id,
  name,
  profile_path,
  url,
}) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Use a generic placeholder if profile_path is null
  const imageSrc = profile_path
    ? `https://image.tmdb.org/t/p/w500/${profile_path}` // Larger image for better quality
    : "https://placehold.co/500x750/333333/FFFFFF?text=No+Image"; // Generic placeholder

  return (
    // Adjust dimensions to be similar to MediaCard for grid consistency
    <div className="relative group w-[260px] h-[390px] max-sm:w-[150px] max-sm:h-[240px]">
      <Link
        to={url}
        params={{ personId: id }} // Ensure correct parameter for TanStack Router
        className="block w-full h-full rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:scale-95 transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-500/50 outline-none bg-[rgba(24,24,24,0.95)]"
        aria-label={`View details for ${name}`}>
        <div
          className={`relative w-full h-full bg-[#333] ${
            !isImageLoaded ? "animate-pulse" : ""
          }`}>
          <img
            src={imageSrc}
            alt={name}
            // Use object-cover and object-top for better person image display
            className="w-full h-full object-cover object-top opacity-0 transition-opacity duration-300"
            loading="lazy"
            onLoad={(e) => {
              e.currentTarget.style.opacity = "1";
              setIsImageLoaded(true);
            }}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                "https://placehold.co/500x750/333333/FFFFFF?text=No+Image";
              setIsImageLoaded(true);
            }}
          />
        </div>
        {/* Overlay for name */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 max-sm:p-2">
          <h3 className="text-base font-bold text-white line-clamp-2 max-sm:text-sm roboto-condensed-bold text-center">
            {name}
          </h3>
        </div>
      </Link>
    </div>
  );
};

export default PersonSearchCard;
