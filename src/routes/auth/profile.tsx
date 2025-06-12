import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { auth, db } from "@/config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/Loading";
import MediaCard from "@/components/MediaCard";
import EditProfileForm from "@/components/EditProfileForm";
import male from "/male.jpg?url";
import female from "/female.jpg?url";

export interface Bookmark {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
  category: "movie" | "tv";
}

interface UserData {
  username?: string;
  gender?: string;
}

export const Route = createFileRoute("/auth/profile")({
  component: Profile,
});

function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "movie" | "tv">("all");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const { data: userData } = useQuery<UserData>({
    queryKey: ["userData", user?.uid],
    queryFn: async () => {
      if (!user) return {};
      const userDoc = await getDoc(doc(db, "users", user.uid));
      return userDoc.exists() ? (userDoc.data() as UserData) : {};
    },
    enabled: !!user,
  });

  const {
    data: bookmarks = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Bookmark[]>({
    queryKey: ["bookmarks", user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const bookmarksRef = collection(db, "users", user.uid, "bookmarks");
      const snapshot = await getDocs(bookmarksRef);
      const bookmarksData: Bookmark[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (
          typeof data?.id === "number" &&
          typeof data?.title === "string" &&
          typeof data?.vote_average === "number" &&
          typeof data?.release_date === "string" &&
          ["movie", "tv"].includes(data?.category) &&
          (data?.poster_path === null || typeof data?.poster_path === "string")
        ) {
          bookmarksData.push(data as Bookmark);
        } else {
          console.warn(`Invalid bookmark data for ${doc.id}:`, data);
        }
      });
      return bookmarksData;
    },
    enabled: !!user,
    refetchOnMount: "always",
  });

  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [user, refetch]);

  const filteredBookmarks =
    bookmarks?.filter((bookmark) =>
      filter === "all" ? true : bookmark?.category === filter
    ) || [];

  const getFallbackImage = () => {
    if (user?.photoURL) return user.photoURL;
    return userData?.gender === "female" ? female : male;
  };

  if (!user) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[rgba(10,10,10,0.9)] backdrop-blur-sm">
        <p className="text-white text-xl font-light">
          Please log in to view your profile
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[rgba(10,10,10,0.9)] backdrop-blur-sm">
        <p className="text-red-400 text-xl font-light">
          Error loading bookmarks: {error?.message}
        </p>
      </div>
    );
  }

  return (
    <>
      <title>Trailer Base - Profile</title>

      <div className="w-full min-h-screen flex flex-col gap-6 py-4 px-6 mx-auto max-w-6xl  text-gray-200">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Profile
        </h1>

        <section className="flex flex-col md:flex-row items-center justify-between gap-6">
          <aside className="flex items-center gap-6 flex-col md:flex-row">
            <img
              src={getFallbackImage()}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-2 border-[rgba(255,255,255,0.2)] shadow-lg"
            />
            <h3 className="text-md sm:text-lg font-light text-white">
              {user?.displayName ||
                userData?.username ||
                "Anonymous, please set a username!"}
            </h3>
          </aside>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-[#333]/50 backdrop-blur-md text-white font-semibold text-sm px-5 py-3 rounded-full hover:scale-105 transition-all shadow-md">
            Edit Profile
          </button>
        </section>
        <div className="border-t border-white/10"></div>

        <section className="mt-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Your Bookmarks
            </h2>
            <div className="flex gap-2">
              {["all", "movie", "tv"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type as "all" | "movie" | "tv")}
                  className={`flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-lg bg-[#333]/50 backdrop-blur-md  transition-colors duration-200 ease-in-out hover:scale-105 ${
                    filter === type ? "bg-white text-black" : "text-gray-100"
                  }`}
                  aria-pressed={filter === type}
                  aria-label={`Show ${type === "all" ? "All" : type === "movie" ? "Movies" : "TV"} bookmarks`}
                  role="button">
                  {type === "all" ? "All" : type === "movie" ? "Movies" : "TV"}
                </button>
              ))}
            </div>
          </div>
          {isLoading ? (
            <Loading />
          ) : filteredBookmarks?.length === 0 ? (
            <p className="text-gray-300 text-lg font-light p-4">
              No bookmarks yet. Add some movies or TV shows to your bookmarks!
            </p>
          ) : (
            
            <div className="w-full absolute left-0 flex flex-wrap gap-2 md:gap-6 justify-center mt-10">
              {filteredBookmarks
                 ?.filter(
                  (bookmark) => bookmark && bookmark.id && bookmark.title
                )
                .map((bookmark) => (
                  <MediaCard
                    key={`${bookmark.category}-${bookmark.id}`}
                    id={bookmark.id}
                    title={bookmark.title}
                    release_date={bookmark.release_date}
                    poster_path={bookmark.poster_path}
                    vote_average={bookmark.vote_average}
                    type={bookmark.category}
                  />
                ))}
            </div>
          )}
        </section>
      </div>

      <EditProfileForm
        isShowing={modalOpen}
        hide={() => setModalOpen(false)}
        user={user}
      />
    </>
  );
}

export default Profile;
