import { Link } from "@tanstack/react-router";
import React, { useState } from "react";
import { auth, db } from "@/config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import useBookmarkMutations from "./useBookmarkMutations";
import { BookmarkPlus, BookmarkMinus, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="relative group w-[180px] h-[270px] max-sm:w-[140px] max-sm:h-[210px] ">
      <Card className="w-full h-full rounded-lg overflow-hidden shadow-lg hover:shadow-xl hover:scale-95 transition-all duration-300 ease-in-out bg-[rgba(24,24,24,0.95)] border-0 p-0">
        <CardContent className="p-0 w-full h-full">
          <Link
            to={type === "movie" ? "/movie/$movieId" : "/tv/$tvId"}
            params={
              type === "movie"
                ? { movieId: id?.toString() ?? "" }
                : { tvId: id?.toString() ?? "" }
            }
            className="block w-full h-full rounded-lg overflow-hidden focus:ring-2 focus:ring-[#FACC15]/50 outline-none"
          >
            <div className="relative w-full h-full">
              {!isImageLoaded && (
                <Skeleton className="w-full h-full rounded-lg absolute inset-0" />
              )}
              <img
                src={
                  poster_path
                    ? `https://image.tmdb.org/t/p/w500/${poster_path}`
                    : "/poster.png"
                }
                alt={title ?? "Media item"}
                className={`w-full h-full object-cover transition-opacity duration-300 rounded-lg ${
                  isImageLoaded ? "opacity-100" : "opacity-0"
                }`}
                loading="lazy"
                onLoad={() => {
                  setIsImageLoaded(true);
                }}
              />

              {/* Overlay content */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 space-y-2 max-sm:p-2.5 max-sm:space-y-1.5 rounded-lg">
                <div className="flex items-center gap-2 max-sm:gap-1.5">
                  <Star size={15} className="text-[#FACC15] flex-shrink-0" />
                  <span className="text-xs font-semibold text-[#FACC15] max-sm:text-[10px]">
                    {vote_average?.toFixed(1) ?? "N/A"}/10
                  </span>
                </div>
                <p className="text-xs text-gray-400 max-sm:text-[10px] leading-relaxed">
                  {release_date ?? "N/A"}
                </p>
                <h4 className="text-sm font-bold text-white line-clamp-2 max-sm:text-xs poppins-regular leading-snug">
                  {title ?? "Untitled"}
                </h4>
              </div>
            </div>
          </Link>
        </CardContent>
      </Card>
      {auth?.currentUser && (
        <>
          {isBookmarked ? (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 left-3 p-2 bg-[rgba(24,24,24,0.9)] rounded-full text-red-500 hover:bg-red-500 hover:text-white focus:ring-2 focus:ring-red-500/50 transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-md max-sm:p-1.5 max-sm:top-2.5 max-sm:left-2.5 h-auto w-auto"
              onClick={() =>
                removeBookmarkMutation?.mutate(id?.toString() ?? "")
              }
              disabled={removeBookmarkMutation?.isPending}
              aria-label={`Remove ${title ?? "media item"} from bookmarks`}
            >
              <BookmarkMinus size={18} className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 left-3 p-2 bg-black rounded-full text-white hover:bg-white hover:text-black focus:ring-2 focus:ring-[#FACC15]/50 transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-md max-sm:p-1.5 max-sm:top-2.5 max-sm:left-2.5 h-auto w-auto"
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
              aria-label={`Add ${title ?? "media item"} to bookmarks`}
            >
              <BookmarkPlus size={18} className="h-4 w-4" />
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default MediaCard;