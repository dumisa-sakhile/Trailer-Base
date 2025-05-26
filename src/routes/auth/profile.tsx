import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { auth, db } from "@/config/firebase";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import type { User } from "firebase/auth";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Loading from "@/components/Loading";
import male from "/male.jpg?url";
import female from "/female.jpg?url";
import { useBookmarkMutations } from "@/components/useBookmarkMutations";

// Interface for bookmark data
export interface Bookmark {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
  category: "movie" | "tv";
}

// Interface for user data in Firestore
interface UserData {
  username?: string;
  gender?: string;
}

// Modal component for editing profile
function EditProfileModal({
  isShowing,
  hide,
  user,
}: {
  isShowing: boolean;
  hide: () => void;
  user: User | null;
}) {
  const queryClient = useQueryClient();
  const { data: userData } = useQuery<UserData>({
    queryKey: ["userData", user?.uid],
    queryFn: async () => {
      if (!user) return {};
      const userDoc = await getDoc(doc(db, "users", user.uid));
      return userDoc.exists() ? (userDoc.data() as UserData) : {};
    },
    enabled: !!user,
  });

  const [newUsername, setNewUsername] = useState("");
  const [gender, setGender] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.displayName) {
      setNewUsername(user.displayName);
    } else if (userData?.username) {
      setNewUsername(userData.username);
    }
    if (userData?.gender) {
      setGender(userData.gender);
    }
  }, [user, userData]);

  const profileMutation = useMutation({
    mutationFn: async ({
      username,
      gender,
    }: {
      username: string;
      gender: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      await updateProfile(user, { displayName: username });
      await setDoc(
        doc(db, "users", user.uid),
        {
          username,
          gender,
        },
        { merge: true }
      );
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["userData", user?.uid] });
      setNewUsername("");
      setGender("");
      hide();
    },
    onError: (error: any) => {
      setError(error.message || "Failed to update profile");
      if (error.code === "auth/requires-recent-login") {
        toast.error("Please log in again to update your profile");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newUsername || newUsername.length < 3) {
      setError("Username must be at least 3 characters long");
      return;
    }
    profileMutation.mutate({ username: newUsername, gender });
  };

  if (!isShowing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-md bg-[#1C1C1E] text-white rounded-2xl shadow-xl p-6 md:p-8 animate-slide-up">
        {/* Close Button */}
        <button
          onClick={hide}
          className="absolute top-4 right-4 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30 rounded-full"
          aria-label="Close">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Heading */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">
            Enter your
            <br />
            profile details
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Please fill in your username and gender to complete your profile.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="text-red-300 text-sm font-medium mb-5 p-3 rounded-md bg-[rgba(255,75,75,0.15)] backdrop-blur-sm border border-[rgba(255,75,75,0.25)] text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="text-sm text-gray-300 block mb-1">
                Username*
              </label>
              <input
                id="username"
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Your handle"
                className="w-full rounded-lg bg-[#2A2A2D] text-white px-4 py-3 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label
                htmlFor="gender"
                className="text-sm text-gray-300 block mb-1">
                Gender
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-lg bg-[#2A2A2D] text-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                required>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="submit"
              disabled={profileMutation.isPending}
              className="bg-white text-black font-semibold px-5 py-2 rounded-full hover:opacity-90 transition-all">
              {profileMutation.isPending ? "Updating..." : "Done"}
            </button>
            <button
              type="button"
              onClick={hide}
              className="text-sm text-gray-400 hover:text-white px-4 py-2 rounded-full transition">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/auth/profile")({
  component: Profile,
});

function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "movie" | "tv">("all");
  const { removeBookmarkMutation } = useBookmarkMutations();

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
    data: bookmarks,
    isLoading,
    error,
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
          typeof data.id === "number" &&
          typeof data.title === "string" &&
          (data.poster_path === null || typeof data.poster_path === "string") &&
          typeof data.vote_average === "number" &&
          typeof data.release_date === "string" &&
          ["movie", "tv"].includes(data.category)
        ) {
          bookmarksData.push(data as Bookmark);
        } else {
          console.warn(`Invalid bookmark data for ${doc.id}:`, data);
        }
      });
      return bookmarksData;
    },
    enabled: !!user,
  });

  const filteredBookmarks = bookmarks?.filter((bookmark) =>
    filter === "all" ? true : bookmark.category === filter
  );

  const getFallbackImage = () => {
    if (user?.photoURL) return user.photoURL;
    return userData?.gender === "female" ? female : male;
  };

  if (!user) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[rgba(10,10,10,0.9)] backdrop-blur-sm">
        <p className="text-white text-xl roboto-condensed-light">
          Please log in to view your profile
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[rgba(10,10,10,0.9)] backdrop-blur-sm">
        <p className="text-red-400 text-xl roboto-condensed-light">
          Error loading bookmarks: {error.message}
        </p>
      </div>
    );
  }

  return (
    <>
      <title>Trailer Base - Profile</title>

      <div className="w-full min-h-screen flex flex-col gap-12 py-8 px-4 md:px-10 bg-[rgba(10,10,10,0.9)] backdrop-blur-sm">
        <h1 className="text-4xl md:text-5xl text-left roboto-condensed-bold tracking-tight text-white">
          Profile
        </h1>

        <section className="flex flex-col md:flex-row items-center justify-around gap-8 md:gap-12">
          <aside className="flex items-center gap-6 flex-col">
            <img
              src={getFallbackImage()}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-2 border-[rgba(255,255,255,0.2)] shadow-lg"
            />
            <h3 className="roboto-condensed-light text-md text-gray-200">
              {user.displayName || userData?.username || "Anonymous, please set a username!"}
            </h3>
          </aside>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-white text-black font-semibold text-sm px-5 py-2.5 rounded-full hover:opacity-90 transition-all shadow-md">
            Edit Profile
          </button>
        </section>

        <section className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-5xl roboto-condensed-bold text-white">
              Your Bookmarks
            </h2>
            <div className="flex gap-2">
              {["all", "movie", "tv"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type as "all" | "movie" | "tv")}
                  className={`px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-200 ${
                    filter === type
                      ? "bg-white text-black shadow-sm"
                      : "bg-[#2A2A2D] text-white hover:bg-[#3A3A3D]"
                  }`}
                  aria-label={`Show ${type} bookmarks`}>
                  {type === "all" ? "All" : type === "movie" ? "Movies" : "TV"}
                </button>
              ))}
            </div>
          </div>
          {filteredBookmarks?.length === 0 ? (
            <p className="text-gray-300 text-lg roboto-condensed-light bg-[rgba(255,255,255,0.05)] backdrop-blur-sm p-4 rounded-lg border border-[rgba(255,255,255,0.1)]">
              No bookmarks yet. Add some movies or TV shows to your bookmarks!
            </p>
          ) : (
            <div className="flex flex-wrap justify-center  gap-6">
              {filteredBookmarks?.map(
                ({
                  id,
                  title,
                  poster_path,
                  vote_average,
                  release_date,
                  category,
                }) => {
                  if (!id || !title || !category) {
                    console.warn(`Invalid bookmark data for id: ${id}`);
                    return null;
                  }

                  return (
                    <div className="relative group" key={`${category}-${id}`}>
                      <Link
                        to={
                          category === "movie" ? "/movie/$movieId" : "/tv/$tvId"
                        }
                        params={
                          category === "movie"
                            ? { movieId: id?.toString() }
                            : { tvId: id?.toString() }
                        }
                        className="w-[300px] flex-none h-[450px] rounded-xl shadow-lg flex items-center justify-center relative group hover:scale-95 transition-transform duration-300 ease-in-out overflow-hidden bg-[rgba(255,255,255,0.05)] backdrop-blur-sm  hover:ring-2 hover:ring-[rgba(255,255,255,0.2)] hover:rotate-2">
                        <img
                          src={
                            poster_path
                              ? `https://image.tmdb.org/t/p/w500/${poster_path}`
                              : "https://via.placeholder.com/300x450?text=No+Poster"
                          }
                          alt={title}
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.7)] to-transparent transition-opacity flex flex-col justify-end p-4 rounded-xl">
                          <p className="text-gray-200 text-sm">
                            {vote_average?.toFixed(1)}
                          </p>
                          <p className="text-gray-200 text-sm">
                            {release_date}
                          </p>
                          <h3 className="text-white text-lg roboto-condensed-bold">
                            {title}
                          </h3>
                        </div>
                      </Link>
                      <button
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-[rgba(50,50,50,0.7)] backdrop-blur-sm text-white text-sm roboto-condensed-light px-3 py-1 rounded-full border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(50,50,50,0.9)] transition-all duration-300"
                        onClick={() =>
                          removeBookmarkMutation.mutate(id?.toString())
                        }
                        disabled={removeBookmarkMutation.isPending}
                        aria-label={`Remove ${category} bookmark`}>
                        Remove
                      </button>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>
      </div>

      <EditProfileModal
        isShowing={modalOpen}
        hide={() => setModalOpen(false)}
        user={user}
      />
    </>
  );
}
