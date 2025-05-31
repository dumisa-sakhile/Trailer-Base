import { Link } from "@tanstack/react-router";
import React, { useState } from "react";
import { auth, db } from "@/config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { useBookmarkMutations } from "./useBookmarkMutations";
import Tooltip from "./Tooltip";


interface MediaCardProps {
  id?: number;
  title?: string;
  release_date?: string;
  poster_path?: string | null;
  vote_average?: number;
  type?: "movie" | "tv";
}

const MediaCard: React.FC<MediaCardProps> = ({
  id,
  title,
  release_date,
  poster_path,
  vote_average,
  type,
}) => {
  const { addBookmarkMutation, removeBookmarkMutation } =
    useBookmarkMutations();
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Check if this media item is bookmarked
  const { data: isBookmarked } = useQuery<boolean>({
    queryKey: ["bookmarks", auth?.currentUser?.uid, id?.toString()],
    queryFn: async () => {
      if (!auth?.currentUser) return false;
      const bookmarksRef = collection(
        db,
        "users",
        auth.currentUser?.uid,
        "bookmarks"
      );
      const snapshot = await getDocs(bookmarksRef);
      return snapshot?.docs?.some((doc) => doc?.id === id?.toString());
    },
    enabled: !!auth?.currentUser,
  });

  return (
    <div className="relative group w-[260px] h-[390px] max-sm:w-[150px] max-sm:h-[240px]">
      <Link
        to={type === "movie" ? "/movie/$movieId" : "/tv/$tvId"}
        params={
          type === "movie"
            ? { movieId: id?.toString() ?? "" }
            : { tvId: id?.toString() ?? "" }
        }
        className="block w-full h-full rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:scale-95 transition-all duration-300 ease-in-out focus:ring-2 focus:ring-[#FACC15]/50 outline-none bg-[rgba(24,24,24,0.95)]">
        <div
          className={`relative w-full h-full bg-[#333] ${!isImageLoaded ? "animate-pulse" : ""}`}>
          <img
            src={
              poster_path
                ? `https://image.tmdb.org/t/p/w500/${poster_path}`
                : "/poster.png"
            }
            alt={title ?? "Media item"}
            className="w-full h-full object-cover opacity-0 transition-opacity duration-300"
            loading="lazy"
            onLoad={(e) => {
              e.currentTarget.style.opacity = "1";
              setIsImageLoaded(true);
            }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 max-sm:p-2">
          <div className="flex items-center gap-2">
            <svg
              aria-hidden="true"
              className="w-4 h-4 text-[#FACC15]"
              fill="currentColor"
              viewBox="0 0 576 512"
              xmlns="http://www.w3.org/2000/svg">
              <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z" />
            </svg>
            <span className="text-xs font-semibold text-[#FACC15]">
              {vote_average?.toFixed(1) ?? "N/A"}/10
            </span>
          </div>
          <p className="text-xs text-gray-400 max-sm:text-[10px]">
            {release_date ?? "N/A"}
          </p>
          <h3 className="text-base font-bold text-white line-clamp-2 max-sm:text-sm roboto-condensed-bold">
            {title ?? "Untitled"}
          </h3>
        </div>
      </Link>
      {auth?.currentUser && (
        <>
          {isBookmarked ? (
            <button
              className="absolute top-3 right-3 p-2 bg-[rgba(24,24,24,0.9)] rounded-full text-red-500 hover:bg-red-500 hover:text-white focus:ring-2 focus:ring-red-500/50 transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              onClick={() =>
                removeBookmarkMutation?.mutate(id?.toString() ?? "")
              }
              disabled={removeBookmarkMutation?.isPending}
              aria-label={`Remove ${title ?? "media item"} from bookmarks`}>
              <Tooltip label={`Remove ${title ?? "media item"} from bookmarks`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="w-5 h-5 max-sm:w-4 max-sm:h-4 bi bi-bookmark-check-fill"
                  viewBox="0 0 16 16">
                  <path
                    fillRule="evenodd"
                    d="M2 15.5V2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.74.439L8 13.069l-5.26 2.87A.5.5 0 0 1 2 15.5m8.854-9.646a.5.5 0 0 0-.708-.708L7.5 7.793 6.354 6.646a.5.5 0 1 0-.708.708l1.5 1.5a.5.5 0 0 0 .708 0z"
                  />
                </svg>
              </Tooltip>
            </button>
          ) : (
            <button
              className="absolute top-3 right-3 p-2 bg-[rgba(24,24,24,0.9)] rounded-full text-[#FACC15] hover:bg-[#FACC15] hover:text-black focus:ring-2 focus:ring-[#FACC15]/50 transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              onClick={() =>
                addBookmarkMutation?.mutate({
                  id: id ?? 0,
                  title: title ?? "Untitled",
                  poster_path: poster_path ?? null,
                  vote_average: vote_average ?? 0,
                  release_date: release_date ?? "",
                  category: type ?? "movie",
                })
              }
              disabled={addBookmarkMutation?.isPending}
              aria-label={`Add ${title ?? "media item"} to bookmarks`}>
              <Tooltip label={`Add ${title ?? "media item"} to bookmarks`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="w-5 h-5 max-sm:w-4 max-sm:h-4 bi bi-bookmark"
                  viewBox="0 0 16 16">
                  <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1z" />
                </svg>
              </Tooltip>
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default MediaCard;
