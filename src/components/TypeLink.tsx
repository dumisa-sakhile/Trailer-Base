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
      className=" button-style">
      {typeName}
    </Link>
  );
};

export default TypeLink;
