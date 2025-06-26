
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { BookmarkIcon } from '@/components/icons/Icons';
import { db } from '@/config/firebase';

interface BookmarkButtonProps {
  user: import('firebase/auth').User | null;
  movieId: string;
  movieData: {
    id: number;
    title: string;
    poster_path?: string;
    vote_average: number;
    release_date: string;
  };
  isBookmarked: boolean;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  user,
  movieId,
  movieData,
  isBookmarked,
}) => {
  const queryClient = useQueryClient();

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const bookmarkRef = doc(db, 'users', user.uid, 'bookmarks', movieId);

      if (isBookmarked) {
        await deleteDoc(bookmarkRef);
      } else {
        await setDoc(bookmarkRef, {
          ...movieData,
          category: 'movie',
          addedAt: new Date().toISOString(),
        });
      }
    },
    onSuccess: () => {
      toast.success(isBookmarked ? 'Bookmark removed!' : 'Bookmark added!');
      queryClient.invalidateQueries({
        queryKey: ['bookmarks', movieId, user?.uid],
      });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleBookmark = () => {
    if (!user) {
      toast.error('Please login to bookmark movies');
      return;
    }
    bookmarkMutation.mutate();
  };

  return (
    <button
      onClick={handleBookmark}
      disabled={bookmarkMutation.isPending}
      aria-label={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
      className="button-style">
      {bookmarkMutation.isPending ? (
        <span className="loading loading-spinner loading-sm"></span>
      ) : (
        <>
          <BookmarkIcon isBookmarked={!!isBookmarked} />
          <span className="text-md  capitalize">
            {isBookmarked ? "Remove Bookmark" : "Bookmark"}
          </span>
        </>
      )}
    </button>
  );
};

export default BookmarkButton;