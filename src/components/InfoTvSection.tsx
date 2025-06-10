import React from "react";
import TvTypeLink from "./TvTypeLink"; // Adjust path to match your project structure

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
}

const icons: Record<InfoSectionProps["title"], React.ReactNode> = {
  Languages: (
    <svg
      className="w-6 h-6 max-sm:w-5 max-sm:h-5 text-white"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="m13 19 3.5-9 3.5 9m-6.125-2h5.25M3 7h7m0 0h2m-2 0c0 1.63-.793 3.926-2.239 5.655M7.5 6.818V5m.261 7.655C6.79 13.82 5.521 14.725 4 15m3.761-2.345L5 10m2.761 2.655L10.2 15"
      />
    </svg>
  ),
  Genre: (
    <svg
      className="w-6 h-6 max-sm:w-5 max-sm:h-5 text-white"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24">
      <path
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M7.58209 8.96025 9.8136 11.1917l-1.61782 1.6178c-1.08305-.1811-2.23623.1454-3.07364.9828-1.1208 1.1208-1.32697 2.8069-.62368 4.1363.14842.2806.42122.474.73509.5213.06726.0101.1347.0133.20136.0098-.00351.0666-.00036.1341.00977.2013.04724.3139.24069.5867.52125.7351 1.32944.7033 3.01552.4971 4.13627-.6237.8375-.8374 1.1639-1.9906.9829-3.0736l4.8107-4.8108c1.0831.1811 2.2363-.1454 3.0737-.9828 1.1208-1.1208 1.3269-2.80688.6237-4.13632-.1485-.28056-.4213-.474-.7351-.52125-.0673-.01012-.1347-.01327-.2014-.00977.0035-.06666.0004-.13409-.0098-.20136-.0472-.31386-.2406-.58666-.5212-.73508-1.3294-.70329-3.0155-.49713-4.1363.62367-.8374.83741-1.1639 1.9906-.9828 3.07365l-1.7788 1.77875-2.23152-2.23148-1.41419 1.41424Zm1.31056-3.1394c-.04235-.32684-.24303-.61183-.53647-.76186l-1.98183-1.0133c-.38619-.19746-.85564-.12345-1.16234.18326l-.86321.8632c-.3067.3067-.38072.77616-.18326 1.16235l1.0133 1.98182c.15004.29345.43503.49412.76187.53647l1.1127.14418c.3076.03985.61628-.06528.8356-.28461l.86321-.8632c.21932-.21932.32446-.52801.2846-.83561l-.14417-1.1127ZM19.4448 16.4052l-3.1186-3.1187c-.7811-.781-2.0474-.781-2.8285 0l-.1719.172c-.7811.781-.7811 2.0474 0 2.8284l3.1186 3.1187c.7811.781 2.0474.781 2.8285 0l.1719-.172c.7811-.781.7811-2.0474 0-2.8284Z"
      />
    </svg>
  ),
  "Production Companies": (
    <svg
      className="w-6 h-6 max-sm:w-5 max-sm:h-5 text-white"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M8.5 11.5 11 14l4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  ),
  "Production Countries": (
    <svg
      className="w-6 h-6 max-sm:w-5 max-sm:h-5 text-white"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
        d="M4.37 7.657c2.063.528 2.396 2.806 3.202 3.87 1.07 1.413 2.075 1.228 3.192 2.644 1.805 2.289 1.312 5.705 1.312 6.705M20 15h-1a4 4 0 0 0-4 4v1M8.587 3.992c0 .822.112 1.886 1.515 2.58 1.402.693 2.918.351 2.918 2.334 0 .276 0 2.008 1.972 2.008 2.026.031 2.026-1.678 2.026-2.008 0-.65.527-.9 1.177-.9H20M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  ),
};

export default function InfoTvSection({
  title,
  items,
  typeKey,
}: InfoSectionProps) {
  if (!items.length) return null;

  return (
    <section className="flex items-center gap-2 flex-wrap px-4 max-sm:px-2">
      <button
        className="text-white text-md max-sm:text-sm roboto-condensed-light capitalize  backdrop-blur-sm rounded h-10 max-sm:h-8 px-4 max-sm:px-3 py-6 max-sm:py-4 flex items-center gap-2 hover:grayscale-50 transition duration-300 ease-in-out transform hover:scale-95"
        aria-label={title}>
        {icons[title]}
        <span className="text-md max-sm:text-sm roboto-condensed-light capitalize">
          {title}
        </span>
      </button>
      <span className="text-white">|</span>
      {items.map(({ id, name }) => (
        <TvTypeLink
          key={id}
          type={typeKey}
          typeName={name}
          typeId={id.toString()}
          page={1}
        />
      ))}
    </section>
  );
}
