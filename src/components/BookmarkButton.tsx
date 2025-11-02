import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { BookmarkIcon } from "lucide-react";
import { db } from "@/config/firebase";
import AuthDrawer from "./auth/AuthDrawer";

interface BookmarkButtonProps {
  user: import("firebase/auth").User | null;
  movieId: string;
  movieData: {
    id: number;
    title: string;
    poster_path?: string;
    vote_average: number;
    release_date: string;
  };
  isBookmarked: boolean;
  mediaType: "movie" | "tv";
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  user,
  movieId,
  movieData,
  isBookmarked,
  mediaType,
}) => {
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const bookmarkRef = doc(db, "users", user.uid, "bookmarks", movieId);

      if (isBookmarked) {
        await deleteDoc(bookmarkRef);
      } else {
        await setDoc(bookmarkRef, {
          ...movieData,
          category: mediaType,
          addedAt: new Date().toISOString(),
        });
      }
    },
    onSuccess: () => {
      toast.success(isBookmarked ? "Bookmark removed!" : "Bookmark added!");
      queryClient.invalidateQueries({
        queryKey: ["bookmarks", movieId, user?.uid],
      });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleBookmark = () => {
    if (!user) {
      setDrawerOpen(true);
      return;
    }
    bookmarkMutation.mutate();
  };

  // Color logic
  const colorClass = isBookmarked ? "text-red-600" : "text-yellow-600";

  return (
    <>
      <button
        onClick={handleBookmark}
        disabled={bookmarkMutation.isPending}
        aria-label={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
        className={`button-style ${colorClass}`}>
        {bookmarkMutation.isPending ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : (
          <>
            <BookmarkIcon className={colorClass} />
            <span className="text-xs md:text-base capitalize">
              {isBookmarked ? "Remove Bookmark" : "Bookmark"}
            </span>
          </>
        )}
      </button>
      <AuthDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
};

export default BookmarkButton;
