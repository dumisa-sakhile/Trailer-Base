import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import ReactPlayer from "react-player";

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
      setSortedUrls([]);
      setIsLoading(false);
      return;
    }

    const urls = videos
      .filter((video) => video?.site === "YouTube")
      .sort((a, b) => {
        const priorityA = typePriority[a?.type ?? ""] ?? 99;
        const priorityB = typePriority[b?.type ?? ""] ?? 99;
        return priorityA - priorityB;
      })
      .map((video) => `https://www.youtube.com/watch?v=${video?.key}`);

    setSortedUrls(urls);
    setIsLoading(false);
  }, [videos]);

  if (!isShowing || !sortedUrls?.length) return null;

  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot) return null;

  return ReactDOM.createPortal(
    <div
      onClick={hide}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)] backdrop-blur-sm">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[rgba(39,39,39,0.7)] backdrop-blur-md rounded-lg w-full max-w-[90vw] md:max-w-[516px] h-[75vh] max-h-[550px] md:h-[638px] overflow-auto text-gray-100 geist-light shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p>Loading video...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p>Error loading video: {error}</p>
          </div>
        ) : (
          <ReactPlayer
            key={sortedUrls[0]} // Force remount on URL change
            url={sortedUrls[0]} // Use first URL
            // url={sortedUrls[0] ?? "https://www.youtube.com/watch?v=dQw4w9WgXcQ"} // Fallback for testing
            controls
            width="100%"
            height="100%"
            playing // Autoplay to ensure loading
            onError={(e) => setError(e?.message ?? "Unknown error")}
            config={{
              youtube: {
                playerVars: { autoplay: 1 }, // Force YouTube autoplay
              },
            }}
          />
        )}
      </div>
    </div>,
    modalRoot
  );
};

export default Modal;
