import React from "react";
import { Link } from "@tanstack/react-router";

interface TvTypeLinkProps {
  type:
    | "with_original_language"
    | "with_companies"
    | "with_origin_country"
    | "with_genres";
  typeName: string;
  typeId: string | number;
  page: number;
}

const TvTypeLink: React.FC<TvTypeLinkProps> = ({
  type,
  typeName,
  typeId,
  page,
}) => {
  return (
    <Link
      to="/tv/$type/$typeName/$typeId"
      params={{ type: type, typeId: String(typeId), typeName: typeName }}
      search={{ page: page }}
      className="text-white text-md roboto-condensed-light capitalize bg-[rgba(39,39,39,0.5)] backdrop-blur-sm rounded-full h-10 px-4 py-6 flex items-center gap-2 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95">
      {typeName}
    </Link>
  );
};

export default TvTypeLink;
