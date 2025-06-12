import React, { useCallback } from "react";
import ReactPlayer from "react-player";
import { MuteIcon, ReplayIcon, UnMuteIcon } from "./icons/Icons";

interface BackgroundMediaProps {
  videosLoading: boolean;
  showVideo: boolean;
  videoUrl: string | null;
  backdropPath: string | null;
  posterPath: string | null;
  title: string | null;
  setShowVideo: (show: boolean) => void;
  isMuted?: boolean;
  showReplay?: boolean;
  onToggleMute?: () => void;
  onReplay?: () => void;
}

const BackgroundMedia: React.FC<BackgroundMediaProps> = React.memo(
  ({
    videosLoading,
    showVideo,
    videoUrl,
    backdropPath,
    posterPath,
    title,
    setShowVideo,
    isMuted = true,
    showReplay = false,
    onToggleMute,
    onReplay,
  }) => {
    const handleVideoEnd = useCallback(() => {
      setShowVideo(false);
    }, [setShowVideo]);

    // Base image URL for TMDB
    const baseImageUrl = "https://image.tmdb.org/t/p";

    // Responsive image sources
    const getImageSrcSet = (path: string) => `
      ${baseImageUrl}/w780${path} 780w,
      ${baseImageUrl}/w1280${path} 1280w,
      ${baseImageUrl}/original${path} 1920w
    `;

    return (
      <>
        {videosLoading ? (
          <div className="hidden fixed inset-0 -z-10 md:flex items-center justify-center bg-black/50">
            <div className="w-12 h-12 border-4 border-t-gray-100 border-gray-500 rounded-full animate-spin" />
          </div>
        ) : showVideo && videoUrl ? (
          <div className="fixed inset-0 -z-10 overflow-hidden hidden lg:block group">
            <ReactPlayer
              url={videoUrl}
              playing={showVideo}
              loop={false}
              muted={isMuted}
              controls={false}
              width="100%"
              height="100%"
              className="absolute scale-150 transform-gpu"
              onEnded={handleVideoEnd}
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
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {onToggleMute && (
                <button
                  onClick={onToggleMute}
                  className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                  aria-label={isMuted ? "Unmute video" : "Mute video"}
                  tabIndex={0}>
                  {isMuted ? (
                 <MuteIcon/>
                  ) : (
                   <UnMuteIcon/>
                  )}
                </button>
              )}
              {showReplay && onReplay && (
                <button
                  onClick={onReplay}
                  className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                  aria-label="Replay video"
                  tabIndex={0}>
                  <ReplayIcon/>
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {(backdropPath || posterPath) && (
              <img
                src={`${baseImageUrl}/original/${backdropPath || posterPath}`}
                srcSet={getImageSrcSet(backdropPath || posterPath || "")}
                sizes="(max-width: 1024px) 780px, 1280px, 1920px"
                alt={title ? `${title} Poster` : "Movie Poster"}
                loading="lazy"
                fetchPriority="high"
                width="1920"
                height="1080"
                decoding="async"
                className={`fixed inset-0 w-full h-full object-cover -z-10 ${
                  backdropPath ? "hidden lg:block" : "block lg:hidden"
                }`}
              />
            )}
          </>
        )}
      </>
    );
  }
);

export default BackgroundMedia;
