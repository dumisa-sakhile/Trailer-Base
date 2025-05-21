import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import ReactPlayer from "react-player";

interface VideoResult {
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
  id: string;
}

interface ModalProps {
  isShowing: boolean;
  hide: () => void;
  videos: VideoResult[]; // raw video data passed in
}

const typePriority: Record<string, number> = {
  "Extended Preview": 1,
  Trailer: 2,
  Clip: 3,
};

const Modal: React.FC<ModalProps> = ({ isShowing, hide, videos }) => {
  const [sortedUrls, setSortedUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!videos || videos.length === 0) {
      setSortedUrls([]);
      return;
    }

    // Filter YouTube videos and sort by priority
    const urls = videos
      .filter((video) => video.site === "YouTube")
      .slice()
      .sort((a, b) => {
        const priorityA = typePriority[a.type] ?? 99;
        const priorityB = typePriority[b.type] ?? 99;
        return priorityA - priorityB;
      })
      .map((video) => `https://www.youtube.com/watch?v=${video.key}`);

    setSortedUrls(urls);
  }, [videos]);

  if (!isShowing || sortedUrls.length === 0) return null;

  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot) return null;

  return ReactDOM.createPortal(
    <div
      onClick={hide}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)] backdrop-blur-sm"
      >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[rgba(39,39,39,0.5)] backdrop-blur-sm md:rounded-lg w-full md:min-h-1 md:w-[516px] md:h-[638px] overflow-auto text-gray-400">
        <ReactPlayer
          url={sortedUrls} // pass array for playlist
          controls
          width="100%"
          height={"100%"}
        />
      </div>
    </div>,
    modalRoot
  );
};

export default Modal;
