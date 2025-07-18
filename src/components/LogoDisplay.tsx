import React from "react";

interface LogoDisplayProps {
  isVideoPlaying: boolean;
  logosLoading: boolean;
  logosError: boolean;
  selectedLogo: { file_path: string } | undefined;
  title: string;
}

const LogoDisplay: React.FC<LogoDisplayProps> = ({
  isVideoPlaying,
  logosLoading,
  logosError,
  selectedLogo,
  title,
}) => {
  if (!isVideoPlaying) {
    return null;
  }

  return (
    <>
      {logosLoading ? (
        <div className="w-[150px] md:w-[200px] lg:w-[250px] h-[60px]  animate-pulse rounded"></div>
      ) : logosError ? (
        <div className="w-[150px] md:w-[200px] lg:w-[250px] h-[60px]  rounded flex items-center justify-center">
          <p className="text-white text-sm md:text-base geist-regular text-center px-2">
            {title}
          </p>
        </div>
      ) : selectedLogo ? (
        <img
          src={`https://image.tmdb.org/t/p/w500/${selectedLogo.file_path}`}
          alt={`${title} Logo`}
          className="hidden md:flex w-[150px] md:w-[200px] lg:w-[250px] h-auto object-contain"
        />
      ) : (
        <div className="w-[150px] md:w-[200px] lg:w-[250px] h-[60px]  rounded flex items-center justify-center">
          <p className="text-white text-2xl  md:text-base font-bold text-center px-2">
            {title}
          </p>
        </div>
      )}
    </>
  );
};

export default LogoDisplay;
