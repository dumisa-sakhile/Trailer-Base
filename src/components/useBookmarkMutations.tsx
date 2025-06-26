import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "@/config/firebase";
import { toast } from "react-hot-toast";

export interface Bookmark {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
  category: "movie" | "tv"; // Added for Firestore rules and routing
}

export const useBookmarkMutations = () => {
  const queryClient = useQueryClient();

  const addBookmarkMutation = useMutation({
    mutationFn: async (bookmark: Bookmark) => {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");
      const bookmarkRef = doc(
        db,
        "users",
        user.uid,
        "bookmarks",
        bookmark.id.toString()
      );
      await setDoc(bookmarkRef, {
        id: bookmark.id,
        title: bookmark.title,
        poster_path: bookmark.poster_path,
        vote_average: bookmark.vote_average,
        release_date: bookmark.release_date,
        category: bookmark.category, // Include category
      });
    },
    onSuccess: () => {
      toast.success("Bookmark added!");
      queryClient.invalidateQueries({
        queryKey: ["bookmarks", auth.currentUser?.uid],
      });
    },
    onError: (error: any) => {
      console.error("Add bookmark error:", error);
      const message =
        error.code === "permission-denied"
          ? "Permission denied. Ensure bookmark data is valid."
          : error.message || "Failed to add bookmark";
      toast.error(message);
    },
  });

  const removeBookmarkMutation = useMutation({
    mutationFn: async (mediaId: string) => {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");
      const bookmarkRef = doc(db, "users", user.uid, "bookmarks", mediaId);
      await deleteDoc(bookmarkRef);
    },
    onSuccess: () => {
      toast.success("Bookmark removed!");
      queryClient.invalidateQueries({
        queryKey: ["bookmarks", auth.currentUser?.uid],
      });
    },
    onError: (error: any) => {
      console.error("Remove bookmark error:", error);
      const message =
        error.code === "permission-denied"
          ? "Permission denied. Check authentication."
          : error.message || "Failed to remove bookmark";
      toast.error(message);
    },
  });

  return { addBookmarkMutation, removeBookmarkMutation };
};
