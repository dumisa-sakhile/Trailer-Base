import React from "react";
import { Link } from "@tanstack/react-router";

interface TypeLinkProps {
  type:
    | "with_original_language"
    | "with_companies"
    | "with_origin_country"
    | "with_genres";
  typeName: string;
  typeId: string | number;
  page: number;
}

const TypeLink: React.FC<TypeLinkProps> = ({
  type,
  typeName,
  typeId,
  page,
}) => {
  return (
    <Link
      to="/movie/$type/$typeName/$typeId"
      params={{ type: type, typeId: String(typeId), typeName: typeName }}
      search={{ page: page }}
      className=" text-md roboto-condensed-light capitalize bg-[#333]/50 backdrop-blur-md text-base text-gray-100 rounded-full h-10 px-4 py-6 flex items-center gap-2 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95">
      {typeName}
    </Link>
  );
};

export default TypeLink;
