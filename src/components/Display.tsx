import { Link } from "@tanstack/react-router";
import React, { useRef, Suspense } from "react";
import Loading from "@/components/Loading";
import { useQuery } from "@tanstack/react-query";
import { auth, db } from "@/config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useBookmarkMutations } from "./useBookmarkMutations";

interface MovieProps {
  id: number;
  title: string;
  release_date: string;
  poster_path: string;
  vote_average: number;
}

interface DisplayProps {
  data?: { results: MovieProps[] };
  isLoading: boolean;
  isError: boolean;
  error: any;
  category: "movie" | "tv";
}

const Display: React.FC<DisplayProps> = ({
  data,
  isLoading,
  isError,
  error,
  category,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addBookmarkMutation, removeBookmarkMutation } = useBookmarkMutations();

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

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

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
        <div className="flex animate-scroll gap-12 scale-95 sm:gap-10 sm:scale-95 max-sm:gap-6 max-sm:scale-90 px-2">
          {isLoading && <Loading />}
          {isError && <p className="text-red-500">Error: {error.message}</p>}

          {data?.results.map(
            ({
              id,
              title,
              release_date,
              poster_path,
              vote_average,
            }: MovieProps) => (
              <div className="relative group" key={id}>
                <Link
                  to={category === "movie" ? "/movie/$movieId" : "/tv/$tvId"}
                  params={
                    category === "movie"
                      ? { movieId: id.toString() }
                      : { tvId: id.toString() }
                  }
                  className="w-[300px] h-[450px] sm:w-[300px] sm:h-[450px] max-sm:w-[220px] max-sm:h-[360px]
                    flex-none rounded-lg shadow-md flex items-center justify-center relative group
                    hover:scale-95 transition-transform duration-300 ease-in-out overflow-hidden
                    geist-light hover:ring-1 hover:ring-black hover:rotate-3">
                  <Suspense fallback={<Loading />}>
                    <img
                      src={`https://image.tmdb.org/t/p/w440_and_h660_face${poster_path}`}
                      alt={title}
                      className="w-full h-full object-cover rounded-2xl overflow-hidden"
                    />
                  </Suspense>
                  <div className="absolute inset-0 bg-gradient-to-t from-black transition-opacity flex flex-col justify-end p-4 rounded-lg">
                    <p className="text-sm text-white flex items-center">
                      {vote_average.toFixed(1)}/10
                    </p>
                    <p className="text-gray-300 text-sm">{release_date}</p>
                    <h3 className="text-white text-lg sm:text-lg max-sm:text-base roboto-condensed-bold">
                      {title}
                    </h3>
                  </div>
                </Link>

                {auth?.currentUser && (
                  <>
                    {bookmarks?.includes(id.toString()) ? (
                      <button
                        className="absolute top-3 left-3 p-2 bg-[rgba(24,24,24,0.9)] rounded-full text-red-500 hover:bg-red-500 hover:text-white focus:ring-2 focus:ring-red-500/50 transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        onClick={() =>
                          removeBookmarkMutation.mutate(id.toString())
                        }
                        disabled={removeBookmarkMutation.isPending}
                        aria-label={`Remove ${title ?? "media item"} from bookmarks`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="w-5 h-5 max-sm:w-4 max-sm:h-4 bi bi-trash3-fill"
                          viewBox="0 0 16 16">
                          <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
                        </svg>
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
                            release_date,
                            category,
                          })
                        }
                        disabled={addBookmarkMutation.isPending}
                        aria-label={`Add ${title ?? "media item"} to bookmarks`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="w-5 h-5 max-sm:w-4 max-sm:h-4 bi bi-plus-lg"
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
            )
          )}
        </div>
      </div>

      {/* Scroll Buttons */}
      <button
        onClick={scrollLeft}
        aria-label="Scroll Left"
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-[#222222] p-2 rounded-full opacity-70 hover:opacity-100 hover:scale-105 transition-all duration-300 ring-1 ring-white/20 max-sm:hidden">
        <svg
          className="w-6 h-6 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={scrollRight}
        aria-label="Scroll Right"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#222222] p-2 rounded-full opacity-70 hover:opacity-100 hover:scale-105 transition-all duration-300 ring-1 ring-white/20 max-sm:hidden">
        <svg
          className="w-6 h-6 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  );
};

export default Display;