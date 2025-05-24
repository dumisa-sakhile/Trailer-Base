import { Link } from "@tanstack/react-router";
import React, { useRef } from "react";
import Loading from "@/components/Loading";
import { useQuery } from "@tanstack/react-query";
import { auth, db } from "@/config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useBookmarkMutations } from "./useBookmarkMutations"; // Adjust path as needed

interface TVProps {
  id: number;
  title: string; // Mapped from 'name' in the parent component
  first_air_date: string;
  poster_path: string;
  vote_average: number;
}

interface DisplayProps {
  data?: { results: TVProps[] };
  isLoading: boolean;
  isError: boolean;
  error: any;
  category?: "tv"; // Required for bookmarks, defaults to "tv"
}

const TvDisplay: React.FC<DisplayProps> = ({
  data,
  isLoading,
  isError,
  error,
  category = "tv", // Default to "tv"
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addBookmarkMutation, removeBookmarkMutation } =
    useBookmarkMutations();

  // Fetch bookmark IDs to check if a TV show is bookmarked
  const { data: bookmarks } = useQuery<string[]>({
    queryKey: ["bookmarks", auth.currentUser?.uid],
    queryFn: async () => {
      if (!auth.currentUser) return [];
      const bookmarksRef = collection(
        db,
        "users",
        auth.currentUser.uid,
        "bookmarks"
      );
      const snapshot = await getDocs(bookmarksRef);
      return snapshot.docs.map((doc) => doc.id);
    },
    enabled: !!auth.currentUser,
  });

  // Scroll left by 300px
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  // Scroll right by 300px
  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <section className="relative">
     
      <div
        className="overflow-x-scroll w-full h-[470px] scrollbar-hide"
        ref={scrollRef}>
        <div className="flex animate-scroll gap-12 scale-95">
          {isLoading && <Loading />}
          {isError && <p className="text-red-500">Error: {error.message}</p>}

          {data?.results.map(
            ({
              id,
              title,
              first_air_date,
              poster_path,
              vote_average,
            }: TVProps) => (
              <div className="stack relative group" key={id}>
                <Link
                  to="/tv/$tvId"
                  params={{ tvId: id.toString() }}
                  className="w-[300px] flex-none h-[450px] rounded-lg shadow-md flex items-center justify-center relative group hover:scale-95 transition-transform duration-300 ease-in-out overflow-hidden geist-light hover:ring-1 hover:ring-[#333333] hover:rotate-3">
                  <img
                    src={`https://image.tmdb.org/t/p/w440_and_h660_face${poster_path}`}
                    alt={title}
                    className="w-full h-full object-cover rounded-lg overflow-hidden"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#222222] transition-opacity flex flex-col justify-end p-4 rounded-lg">
                    <p className="text-sm flex items-center text-gray-200">
                      {vote_average.toFixed(1)}/10
                    </p>
                    <p className="text-gray-300 text-sm">{first_air_date}</p>
                    <h3 className="text-white text-lg roboto-condensed-bold">
                      {title}
                    </h3>
                  </div>
                </Link>
                {auth.currentUser && (
                  <>
                    {bookmarks?.includes(id.toString()) ? (
                      <button
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-[#222222] text-gray-200 text-sm roboto-condensed-light px-3 py-1 rounded-full hover:bg-[#333333] transition-opacity duration-300"
                        onClick={() =>
                          removeBookmarkMutation.mutate(id.toString())
                        }
                        disabled={removeBookmarkMutation.isPending}
                        aria-label="Remove from Playlist">
                        Remove Bookmark
                      </button>
                    ) : (
                      <button
                        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 bg-[#222222] text-gray-200 text-sm roboto-condensed-light px-3 py-1 rounded-full hover:bg-[#333333] transition-opacity duration-300"
                        onClick={() =>
                          addBookmarkMutation.mutate({
                            id,
                            title,
                            poster_path,
                            vote_average,
                            release_date: first_air_date,
                            category, // Use category prop (defaults to "tv")
                          })
                        }
                        disabled={addBookmarkMutation.isPending}
                        aria-label="Add to Playlist">
                        Add Bookmark
                      </button>
                    )}
                  </>
                )}
              </div>
            )
          )}
        </div>
      </div>
      {/* Scroll Left Button */}
      <button
        onClick={scrollLeft}
        aria-label="Scroll Left"
        className="absolute left-2 top-1/2 transform 
        translate-y-1/2 bg-[#222222] p-2 rounded-full opacity-70 hover:opacity-100 hover:scale-105 transition-all duration-300 ring-1 ring-[#333333]/50">
        <svg
          className="w-6 h-6 text-gray-200"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m15 19-7-7 7-7"
          />
        </svg>
      </button>
      {/* Scroll Right Button */}
      <button
        onClick={scrollRight}
        aria-label="Scroll Right"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#222222] p-2 rounded-full opacity-70 hover:opacity-100 hover:scale-105 transition-all duration-300 ring-1 ring-[#333333]/50">
        <svg
          className="w-6 h-6 text-gray-200"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m9 5 7 7-7 7"
          />
        </svg>
      </button>
    </section>
  );
};

export default TvDisplay;
