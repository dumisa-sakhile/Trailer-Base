import React, { useCallback, useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { VolumeOff, RotateCcw, Volume } from "lucide-react";

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

const DisplayBackgroundMedia: React.FC<BackgroundMediaProps> = React.memo(
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
    const [hasTriggeredTrim, setHasTriggeredTrim] = useState(false);

    // This callback is called when the video ends naturally.
    // It's a fallback in case the onProgress trimming doesn't fire for some reason.
    const handleVideoEnd = useCallback(() => {
      if (!hasTriggeredTrim) {
        // Only set to false if trimming hasn't already done it
        setShowVideo(false);
      }
    }, [setShowVideo, hasTriggeredTrim]);

    // This callback is for trimming the video before its natural end.
    const handleProgress = useCallback(
      ({ played }: { played: number }) => {
        // If video is playing, a URL exists, and it's played more than 90%,
        // and trimming hasn't been triggered yet for this playback cycle.
        if (showVideo && videoUrl && played > 0.9 && !hasTriggeredTrim) {
          // Changed 0.95 to 0.90
          setShowVideo(false); // Stop the video and show backdrop
          setHasTriggeredTrim(true); // Mark that trimming has occurred
        }
      },
      [showVideo, videoUrl, hasTriggeredTrim, setShowVideo]
    );

    // Reset the trimming flag when the video URL or playing state changes,
    // indicating a new playback cycle might be starting.
    useEffect(() => {
      if (showVideo && videoUrl) {
        setHasTriggeredTrim(false);
      }
    }, [showVideo, videoUrl]);

    // Base image URL for TMDB
    const baseImageUrl = "https://image.tmdb.org/t/p";

    // Responsive image sources
    const getImageSrcSet = (path: string) => `
      ${baseImageUrl}/w780${path} 780w,
      ${baseImageUrl}/w1280${path} 1280w,
      ${baseImageUrl}/original${path} 1920w
    `;

    return (
      // Main container for the background media. It will now occupy space in the document flow.
      // It's given a height of h-screen to initially fill the viewport, but it's not fixed.
      // The z-index is still -10 to keep it behind other content.
      <div className="relative w-full h-screen -z-10 hidden lg:block group overflow-hidden">
        {videosLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="w-12 h-12 border-4 border-t-gray-100 border-blue-500 rounded-full animate-spin" />
          </div>
        ) : showVideo && videoUrl ? (
          // ReactPlayer container. It will fill its parent div.
          <div className="absolute inset-0 w-full h-full">
            {" "}
            {/* This div ensures the player fills the parent */}
            <ReactPlayer
              url={videoUrl}
              playing={showVideo}
              loop={false}
              muted={isMuted}
              controls={false}
              width="100%"
              height="100%"
              // Re-added scale-150 and transform-gpu for the fullscreen and zoomed effect
              className="absolute scale-150 transform-gpu"
              onEnded={handleVideoEnd} // Still keep onEnded for natural end
              onProgress={handleProgress} // New: for trimming before end
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
            {/* Control buttons for video, now positioned relative to this container */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {onToggleMute && (
                <button
                  onClick={onToggleMute}
                  className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                  aria-label={isMuted ? "Unmute video" : "Mute video"}
                  tabIndex={0}>
                  {isMuted ? <VolumeOff /> : <Volume />}
                </button>
              )}
              {showReplay && onReplay && (
                <button
                  onClick={onReplay}
                  className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                  aria-label="Replay video"
                  tabIndex={0}>
                  <RotateCcw />
                </button>
              )}
            </div>
          </div>
        ) : (
          // Image fallback, also positioned absolutely within the main container
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
            className="absolute inset-0 w-full h-full object-cover" // Removed fixed, now absolute
          />
        )}
      </div>
    );
  }
);

export default DisplayBackgroundMedia;
