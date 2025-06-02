import React from "react";
import ReactPlayer from "react-player";

interface BackgroundMediaProps {
  videosLoading: boolean;
  showVideo: boolean;
  videoUrl: string | null;
  backdropPath: string | null;
  posterPath: string | null;
  title: string | null;
  setShowVideo: (show: boolean) => void;
}

const BackgroundMedia: React.FC<BackgroundMediaProps> = ({
  videosLoading,
  showVideo,
  videoUrl,
  backdropPath,
  posterPath,
  title,
  setShowVideo,
}) => {
  return (
    <>
      {videosLoading ? (
        <div className="w-full h-full fixed -z-10 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-t-gray-100 border-gray-500 rounded-full animate-spin"></div>
        </div>
      ) : showVideo && videoUrl ? (
        <div className="fixed -z-10 w-full h-full overflow-hidden hidden lg:block">
          <ReactPlayer
            url={videoUrl}
            playing={true}
            loop={false}
            muted={true}
            controls={false}
            width="100%"
            height="100%"
            className="absolute transform scale-150"
            onEnded={() => setShowVideo(false)}
            config={{
              youtube: {
                playerVars: {
                  autoplay: 1,
                  controls: 0,
                  modestbranding: 1,
                  showinfo: 0,
                  rel: 0,
                },
              },
            }}
          />
        </div>
      ) : (
        <>
          {backdropPath && (
            <img
              alt={title || "Movie Poster"}
              loading="lazy"
              width="1920"
              height="1080"
              decoding="async"
              className="w-full h-full object-cover fixed hidden lg:block -z-10"
              src={`https://image.tmdb.org/t/p/original/${backdropPath}`}
            />
          )}
          {posterPath && (
            <img
              alt={title || "Movie Poster"}
              loading="lazy"
              width="1920"
              height="1080"
              decoding="async"
              className="w-full h-full object-cover fixed block lg:hidden -z-10"
              src={`https://image.tmdb.org/t/p/original/${posterPath}`}
            />
          )}
        </>
      )}
    </>
  );
};

export default BackgroundMedia;
