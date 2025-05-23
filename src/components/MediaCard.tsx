import { Link } from "@tanstack/react-router";
import React from "react";
import { auth, db } from "@/config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { useBookmarkMutations } from "./useBookmarkMutations";


interface Bookmark {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
  category: "movie" | "tv";
}

// Interface for media item (movie or TV show)
interface MediaCardProps {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  vote_average: number;
  type: "movie" | "tv"; 
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

  // Check if this media item is bookmarked
  const { data: isBookmarked } = useQuery<boolean>({
    queryKey: ["bookmarks", auth.currentUser?.uid, id.toString()],
    queryFn: async () => {
      if (!auth.currentUser) return false;
      const bookmarksRef = collection(
        db,
        "users",
        auth.currentUser.uid,
        "bookmarks"
      );
      const snapshot = await getDocs(bookmarksRef);
      return snapshot.docs.some((doc) => doc.id === id.toString());
    },
    enabled: !!auth.currentUser,
  });

  return (
    <div className="relative group">
      <Link
        to={type === "movie" ? "/movie/$movieId" : "/tv/$tvId"}
        params={
          type === "movie"
            ? { movieId: id.toString() }
            : { tvId: id.toString() }
        }
        className="w-[300px] flex-none h-[450px] rounded-lg shadow-md flex items-center justify-center relative group hover:scale-95 transition-transform duration-300 ease-in-out overflow-hidden geist-light hover:ring-1 hover:ring-gray-400 hover:rotate-3">
        <img
          src={
            poster_path
              ? `https://image.tmdb.org/t/p/w500/${poster_path}`
              : "https://github.com/dumisa-sakhile/CinemaLand/blob/main/public/poster.png?raw=true"
          }
          alt={title}
          className="w-full h-full object-cover rounded-lg"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent transition-opacity flex flex-col justify-end p-4 rounded-lg">
          <p className="text-yellow-500 text-sm">{vote_average.toFixed(1)}</p>
          <p className="text-gray-300 text-sm">{release_date}</p>
          <h3 className="text-white text-lg roboto-condensed-bold">{title}</h3>
        </div>
      </Link>
      {auth.currentUser && (
        <>
          {isBookmarked ? (
            <button
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-sm roboto-condensed-light px-3 py-1 rounded-full hover:bg-gray-700 transition-all duration-300"
              onClick={() => removeBookmarkMutation.mutate(id.toString())}
              disabled={removeBookmarkMutation.isPending}
              aria-label={`Remove ${type} from bookmarks`}>
              Remove Bookmark
            </button>
          ) : (
            <button
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-sm roboto-condensed-light px-3 py-1 rounded-full hover:bg-gray-700 transition-all duration-300"
              onClick={() =>
                addBookmarkMutation.mutate({
                  id,
                  title,
                  poster_path,
                  vote_average,
                  release_date,
                  category: type,
                } as Bookmark)
              }
              disabled={addBookmarkMutation.isPending}
              aria-label={`Add ${type} to bookmarks`}>
              Add Bookmark
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default MediaCard;
