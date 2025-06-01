import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import ReactPlayer from "react-player/youtube";

interface VideoResult {
  iso_639_1?: string;
  iso_3166_1?: string;
  name?: string;
  key?: string;
  site?: string;
  size?: number;
  type?: string;
  official?: boolean;
  published_at?: string;
  id?: string;
}

interface ModalProps {
  isShowing?: boolean;
  hide?: () => void;
  videos?: VideoResult[];
}

const typePriority: Record<string, number> = {
  "Extended Preview": 1,
  Trailer: 2,
  Clip: 3,
};

const Modal: React.FC<ModalProps> = ({ isShowing, hide, videos }) => {
  const [sortedUrls, setSortedUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ensure modal-root exists
    const modalRoot = document.getElementById("modal-root");
    if (!modalRoot) {
      const root = document.createElement("div");
      root.id = "modal-root";
      document.body.appendChild(root);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    if (!videos?.length) {
      console.log("No videos provided to Modal:", videos);
      setSortedUrls([]);
      setIsLoading(false);
      setError("No videos available to play");
      return;
    }

    const urls = videos
      .filter((video) => {
        const isValid = video?.site === "YouTube" && video?.key;
        if (!isValid) {
          console.log("Filtered out invalid video:", video);
        }
        return isValid;
      })
      .sort((a, b) => {
        const priorityA = typePriority[a?.type ?? ""] ?? 99;
        const priorityB = typePriority[b?.type ?? ""] ?? 99;
        return priorityA - priorityB;
      })
      .map((video) => `https://www.youtube.com/watch?v=${video?.key}`);

    console.log("Sorted URLs for playlist:", urls);

    setSortedUrls(urls);
    setIsLoading(false);
    if (!urls.length) {
      setError("No valid YouTube videos found");
    }
  }, [videos]);

  if (!isShowing) return null;

  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot) {
    console.log("Modal root element not found");
    return null;
  }

  return ReactDOM.createPortal(
    <div
      onClick={hide}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)] backdrop-blur-sm"
      aria-label="Video playlist modal">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[rgba(39,39,39,0.7)] backdrop-blur-md rounded-lg w-full max-w-[90vw] md:max-w-[600px] h-[75vh] max-h-[550px] overflow-auto text-gray-100 geist-regular shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-t-gray-100 border-gray-500 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-center text-sm md:text-base">{error}</p>
          </div>
        ) : (
          <ReactPlayer
            url={sortedUrls}
            controls
            width="100%"
            height="100%"
            playing
            config={{
              playerVars: {
                rel: 0,
                showinfo: 0,
                modestbranding: 1,
                autoplay: 1,
              },
            }}
            onError={(e) => {
              console.error("ReactPlayer error:", e);
              setError("Failed to load playlist");
            }}
          />
        )}
      </div>
    </div>,
    modalRoot
  );
};

export default Modal;
