import { Link } from "@tanstack/react-router";
import React, { useState } from "react";
import { auth, db } from "@/config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { useBookmarkMutations } from "./useBookmarkMutations";


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
              className="absolute top-3 left-3 p-2 bg-[rgba(24,24,24,0.9)] rounded-full text-red-500 hover:bg-red-500 hover:text-white focus:ring-2 focus:ring-red-500/50 transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              onClick={() =>
                removeBookmarkMutation?.mutate(id?.toString() ?? "")
              }
              disabled={removeBookmarkMutation?.isPending}
              aria-label={`Remove ${title ?? "media item"} from bookmarks`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-trash3-fill"
                viewBox="0 0 16 16">
                <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
              </svg>
            </button>
          ) : (
            <button
              className="absolute top-3 right-3 p-2 bg-black rounded-full text-white hover:bg-white hover:text-black focus:ring-2 focus:ring-[#FACC15]/50 transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-plus-lg"
                viewBox="0 0 16 16">
                <path
                  fillRule="evenodd"
                  d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"
                />
              </svg>
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default MediaCard;
