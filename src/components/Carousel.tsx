import React from "react";
import { Link } from "@tanstack/react-router";

interface MediaItem {
  imageUrl: string;
  title: string;
  date: string;
  url: string;
  id: string;
}

interface MediaCarouselProps {
  mediaItems: Record<string, MediaItem>;
}

const MediaCarousel: React.FC<MediaCarouselProps> = ({ mediaItems }) => {
  return (
    <div className="absolute left-0 overflow-x-scroll w-full h-[470px]">
      <div className="flex animate-scroll gap-12 scale-95">
        {Object.entries(mediaItems).map(([key, item]) => (
          <Link
            to={item.url}
            key={item.id}
            className="w-[300px] flex-none h-[450px] rounded-lg shadow-md flex items-center justify-center relative group hover:scale-95 transition-transform duration-300 ease-in-out overflow-hidden stack geist-light hover:ring-1 hover:ring-black hover:rotate-3">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover rounded-lg overflow-hidden"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black transition-opacity flex flex-col justify-end p-4 rounded-lg">
              <h3 className="text-white text-lg">{item.title}</h3>
              <p className="text-white text-sm">{item.date}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MediaCarousel;
