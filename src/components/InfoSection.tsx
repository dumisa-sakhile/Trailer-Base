import React from "react";
import { Languages, Tag, Building, Globe } from "lucide-react";
import TypeLink from "./TypeLink";

interface InfoItem {
  id: string | number;
  name: string;
}

interface InfoSectionProps {
  title:
    | "Languages"
    | "Genre"
    | "Production Companies"
    | "Production Countries";
  items: InfoItem[];
  typeKey:
    | "with_original_language"
    | "with_genres"
    | "with_companies"
    | "with_origin_country";
  mediaType: "movie" | "tv";
}

const icons: Record<InfoSectionProps["title"], React.ReactNode> = {
  Languages: (
    <Languages
      className="w-6 h-6 max-sm:w-5 max-sm:h-5 text-white"
      aria-hidden="true"
    />
  ),
  Genre: (
    <Tag
      className="w-6 h-6 max-sm:w-5 max-sm:h-5 text-white"
      aria-hidden="true"
    />
  ),
  "Production Companies": (
    <Building
      className="w-6 h-6 max-sm:w-5 max-sm:h-5 text-white"
      aria-hidden="true"
    />
  ),
  "Production Countries": (
    <Globe
      className="w-6 h-6 max-sm:w-5 max-sm:h-5 text-white"
      aria-hidden="true"
    />
  ),
};

export default function InfoSection({
  title,
  items,
  typeKey,
  mediaType,
}: InfoSectionProps) {
  if (!items.length) return null;

  return (
    <section className="flex items-center gap-2 flex-wrap px-4 max-sm:px-2 w-full justify-center md:justify-start md:items-start">
      <button className="button-style" aria-label={title}>
        {icons[title]}
        <span className="text-md capitalize">{title}</span>
      </button>
      <span className="text-white">|</span>
      {items.map(({ id, name }) => (
        <TypeLink
          key={id}
          type={typeKey}
          typeName={name}
          typeId={id.toString()}
          page={1}
          mediaType={mediaType}
        />
      ))}
    </section>
  );
}
