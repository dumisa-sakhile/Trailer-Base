import { createPortal } from "react-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchMovies } from "@/api/movie";
import { searchTV } from "@/api/tv";
import { searchPerson } from "@/api/people";
import { useSearchContext } from "@/context/searchContext";
import { SearchIcon } from "./icons/Icons";
import SearchCard from "./SearchCard";
import { motion, AnimatePresence } from "framer-motion";

interface SearchCardProps {
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  type: string;
  url: string;
  id: string;
}

const Search = () => {
  const { status, setStatus, pageType } = useSearchContext();
  const [search, setSearch] = useState("");
  const [page] = useState(1);

  const queryOptions = {
    queryKey: ["search", search, page],
    enabled: !!search,
  };

  const movieQuery = useQuery({
    ...queryOptions,
    queryFn: () => searchMovies(page, search),
    enabled: queryOptions.enabled && pageType === "movies",
  });

  const tvQuery = useQuery({
    ...queryOptions,
    queryFn: () => searchTV(page, search),
    enabled: queryOptions.enabled && pageType === "tv",
  });

  const personQuery = useQuery({
    ...queryOptions,
    queryFn: () => searchPerson(page, search),
    enabled: queryOptions.enabled && pageType === "people",
  });

  const results = (() => {
    const raw =
      pageType === "movies"
        ? movieQuery.data?.results
        : pageType === "tv"
          ? tvQuery.data?.results
          : personQuery.data?.results;

    if (!raw) return [];

    return raw
      .filter((item: any) => item?.poster_path || item?.profile_path)
      .map((item: any) => ({
        id: item?.id?.toString() ?? "",
        title:
          pageType === "movies"
            ? item?.title
            : pageType === "tv"
              ? item?.name
              : (item?.name ?? "Unknown"),
        poster_path:
          item?.poster_path ?? item?.profile_path ?? "/fallback-image.jpg",
        release_date:
          item?.release_date ?? item?.first_air_date ?? "Unknown Date",
        vote_average: item?.vote_average ?? 0,
        type: pageType,
        url: `/${pageType}/${item?.id ?? "#"}`,
      }));
  })();

  const isLoading =
    pageType === "movies"
      ? movieQuery.isLoading
      : pageType === "tv"
        ? tvQuery.isLoading
        : personQuery.isLoading;

  const isError =
    pageType === "movies"
      ? movieQuery.isError
      : pageType === "tv"
        ? tvQuery.isError
        : personQuery.isError;

  const errorMessage =
    pageType === "movies"
      ? (movieQuery.error as Error)?.message
      : pageType === "tv"
        ? (tvQuery.error as Error)?.message
        : (personQuery.error as Error)?.message;

  const label =
    pageType === "movies"
      ? "Movies"
      : pageType === "tv"
        ? "TV Shows"
        : "People";

  if (!status) return null;

  return createPortal(
    <AnimatePresence>
      {status && (
        <motion.section
          onClick={() => setStatus(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1117]/50 backdrop-blur-md transition-all"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}>
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="w-[90%] max-w-[500px] h-[90%] md:h-[600px] bg-[#0D1117]/80 backdrop-blur-lg rounded-lg shadow-xl overflow-hidden flex flex-col ring-1 ring-gray-800/50"
            initial={{ y: "-100vh" }}
            animate={{ y: 0 }}
            exit={{ y: "100vh" }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}>
            {/* Search Header */}
            <header className="p-0 border-b border-gray-800">
              <div className="relative w-full">
                <input
                  autoFocus
                  type="search"
                  placeholder={`Search ${label.toLowerCase()}, e.g. ${
                    pageType === "movies"
                      ? "Inception"
                      : pageType === "tv"
                        ? "The Chosen"
                        : "Nomzamo Mbatha"
                  }`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-12 px-4 py-2 rounded-t-lg bg-[#0D1117]/80 border-none text-white placeholder:text-gray-500 text-sm pl-12 leading-5 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                  <SearchIcon fill="white" />
                </span>
              </div>
            </header>
            <br />
            {/* Content */}
            <main className="p-4 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white text-base roboto-condensed-light">
                  {label} Results
                </h2>
                <button
                  className="md:hidden text-white text-xs bg-gray-800/50 px-3 py-1 rounded hover:bg-gray-700 transition"
                  onClick={() => setStatus(false)}>
                  Close
                </button>
              </div>
              <br />
              <section className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                {isLoading && (
                  <p className="col-span-full text-center text-gray-500 animate-pulse">
                    Loading...
                  </p>
                )}
                {isError && (
                  <p className="col-span-full text-center text-red-400">
                    Error: {errorMessage}
                  </p>
                )}
                {!isLoading && search && results.length === 0 && (
                  <p className="col-span-full text-center text-gray-500">
                    No {label.toLowerCase()} found.
                  </p>
                )}
                {!search && (
                  <p className="col-span-full text-center text-gray-500">
                    Start typing to search your favorite {label.toLowerCase()}
                    ...
                  </p>
                )}
                {results.map((item: SearchCardProps) => (
                  <motion.div
                    key={`${item.type}-${item.id}`}
                    className="transition-all duration-300 transform hover:scale-105"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}>
                    <SearchCard {...item} />
                  </motion.div>
                ))}
              </section>
            </main>
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>,
    document.getElementById("modal-root")!
  );
};

export default Search;
