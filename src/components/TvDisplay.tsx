import { Link } from "@tanstack/react-router";
import React, { useRef } from "react";
import Loading from "@/components/Loading";
import { useQuery } from "@tanstack/react-query";
import { auth, db } from "@/config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useBookmarkMutations } from "./useBookmarkMutations"; // Adjust path as needed
import Tooltip from "./Tooltip";

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
        className="overflow-x-scroll w-full min-h-[70px] scrollbar-hide"
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
              <div className=" relative group" key={id}>
                <Link
                  to="/tv/$tvId"
                  params={{ tvId: id.toString() }}
                  className="w-[300px] h-[450px] max-sm:w-[220px] max-sm:h-[330px] flex-none rounded-lg shadow-md flex items-center justify-center relative group hover:scale-95 transition-transform duration-300 ease-in-out overflow-hidden geist-light hover:ring-1 hover:ring-[#333333] hover:rotate-3">
                  <img
                    src={`https://image.tmdb.org/t/p/w440_and_h660_face${poster_path}`}
                    alt={title}
                    className="w-full h-full object-cover rounded-2xl overflow-hidden"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black transition-opacity flex flex-col justify-end p-4 rounded-lg">
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
                        className="absolute top-3 right-3 p-2 bg-[rgba(24,24,24,0.9)] rounded-full text-red-500 hover:bg-red-500 hover:text-white focus:ring-2 focus:ring-red-500/50 transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        onClick={() =>
                          removeBookmarkMutation.mutate(id.toString())
                        }
                        disabled={removeBookmarkMutation.isPending}
                        aria-label={`Remove ${title ?? "media item"} from bookmarks`}>
                        <Tooltip
                          label={`Remove ${title ?? "media item"} from bookmarks`}>
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
                        aria-label={`Add ${title ?? "media item"} to bookmarks`}>
                        <Tooltip
                          label={`Add ${title ?? "media item"} to bookmarks`}>
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
