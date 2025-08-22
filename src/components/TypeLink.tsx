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
  mediaType: "movie" | "tv";
}

const TypeLink: React.FC<TypeLinkProps> = ({
  type,
  typeName,
  typeId,
  page,
  mediaType,
}) => {
  return (
    <Link
      to={`/${mediaType}/$type/$typeName/$typeId`}
      params={{ type, typeName, typeId: String(typeId) }}
      search={{ page }}
      className="button-style text-xs md:text-base">
      {typeName}
    </Link>
  );
};

export default TypeLink;
