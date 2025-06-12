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
      className="button-style">
      {typeName}
    </Link>
  );
};

export default TvTypeLink;
