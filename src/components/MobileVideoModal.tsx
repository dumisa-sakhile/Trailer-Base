import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import ReactPlayer from "react-player";
import { X } from "lucide-react";

interface MobileVideoModalProps {
  open: boolean;
  onClose: () => void;
  videoUrl: string;
  isMuted: boolean;
  onToggleMute: () => void;
}

const modalRoot = document.getElementById("modal-root") || document.body;

const MobileVideoModal: React.FC<MobileVideoModalProps> = ({
  open,
  onClose,
  videoUrl,
  isMuted,
}) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <button
        className="absolute top-4 right-4 text-white bg-black/60 rounded-full p-2 z-10"
        onClick={onClose}
        aria-label="Close">
        <X size={28} />
      </button>
      <div className="relative w-full max-w-[360px] h-[640px] flex items-center justify-center">
        <ReactPlayer
          url={videoUrl}
          playing={open}
          controls
          muted={isMuted}
          width="100%"
          height="100%"
          style={{ borderRadius: 12, background: "#000" }}
        />
      </div>
    </div>,
    modalRoot
  );
};

export default MobileVideoModal;
