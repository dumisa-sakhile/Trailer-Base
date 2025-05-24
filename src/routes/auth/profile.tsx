import { createFileRoute, Link } from "@tanstack/react-router";
import Button from "@/components/Button";
import { useState, useEffect } from "react";
import { auth, db } from "@/config/firebase";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import type { User } from "firebase/auth";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Loading from "@/components/Loading";
import male from "/male.jpg?url"; // fallback profile image
import female from "/female.jpg?url"; // fallback profile image
import { useBookmarkMutations } from "@/components/useBookmarkMutations";

// Interface for bookmark data
export interface Bookmark {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
  category: 'movie' | 'tv'; // Added for routing
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

  // Pre-fill username and gender if they exist
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
      // Update Firebase Auth profile
      await updateProfile(user, { displayName: username });
      // Update Firestore user document
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
      setError("Please enter a valid username (minimum 3 characters)");
      return;
    }
    profileMutation.mutate({ username: newUsername, gender });
  };

  if (!isShowing) return null;

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="bg-black p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl roboto-condensed-bold text-white mb-4">
          Edit Profile
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="username"
              className="text-white roboto-condensed-light">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.1)] text-white py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(255,255,255,0.1)]"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label
              htmlFor="gender"
              className="text-white roboto-condensed-light">
              Gender
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.1)] text-white py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(255,255,255,0.1)] peer">
              <option value="" className="text-black bg-white">
                Select gender
              </option>
              <option value="male" className="text-black bg-white">
                Male
              </option>
              <option value="female" className="text-black bg-white">
                Female
              </option>
              <option value="other" className="text-black bg-white">
                Other
              </option>
            </select>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          <div className="flex gap-4">
            <Button
              type="submit"
              variant="primary"
              disabled={profileMutation.isPending}>
              {profileMutation.isPending ? "Updating..." : "Update Profile"}
            </Button>
            <Button type="button" variant="ghost" onClick={hide}>
              Cancel
            </Button>
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
  // const queryClient = useQueryClient();
  const { removeBookmarkMutation } = useBookmarkMutations();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch user data (username and gender) from Firestore
  const { data: userData } = useQuery<UserData>({
    queryKey: ["userData", user?.uid],
    queryFn: async () => {
      if (!user) return {};
      const userDoc = await getDoc(doc(db, "users", user.uid));
      return userDoc.exists() ? (userDoc.data() as UserData) : {};
    },
    enabled: !!user,
  });

  // Fetch bookmarks from Firestore
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
        // Validate bookmark data
        if (
          typeof data.id === 'number' &&
          typeof data.title === 'string' &&
          (data.poster_path === null || typeof data.poster_path === 'string') &&
          typeof data.vote_average === 'number' &&
          typeof data.release_date === 'string' &&
          ['movie', 'tv'].includes(data.category)
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

  // Determine fallback image based on gender
  const getFallbackImage = () => {
    if (user?.photoURL) return user.photoURL;
    return userData?.gender === "female" ? female : male;
  };

  if (!user) {
    return (
      <div className="w-full min-h-lvh flex items-center justify-center bg-black">
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
      <div className="w-full min-h-lvh flex items-center justify-center bg-black">
        <p className="text-red-500 text-xl roboto-condensed-light">
          Error loading bookmarks: {error.message}
        </p>
      </div>
    );
  }

  return (
    <>
      <title>Trailer Base - Profile</title>

      <div className="w-full min-h-lvh flex flex-col gap-12 py-8 px-4 md:px-10 bg-black">
        <h1 className="text-4xl md:text-5xl text-left roboto-condensed-bold tracking-tight text-white">
          Profile
        </h1>

        <section className="flex flex-col md:flex-row items-center justify-around gap-8 md:gap-12">
          <aside className="flex items-center gap-6 flex-col">
            <img
              src={getFallbackImage()}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-2 border-gray-700"
            />
            <h3 className="roboto-condensed-light text-xl md:text-2xl text-gray-200">
              {user.displayName || userData?.username || "User"}
            </h3>
          </aside>
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            Edit Profile
          </Button>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl md:text-3xl roboto-condensed-bold mb-6 text-white">
            Your Bookmarks
          </h2>
          {bookmarks?.length === 0 ? (
            <p className="text-gray-300 text-lg roboto-condensed-light">
              No bookmarks yet. Add some movies or TV shows to your bookmarks!
            </p>
          ) : (
            <div className="flex flex-wrap gap-6">
              {bookmarks?.map(
                ({
                  id,
                  title,
                  poster_path,
                  vote_average,
                  release_date,
                  category,
                }) => {
                  // Validate bookmark data before rendering
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
                        className="w-[300px] flex-none h-[450px] rounded-lg shadow-md flex items-center justify-center relative group hover:scale-95 transition-transform duration-300 ease-in-out overflow-hidden geist-light hover:ring-1 hover:ring-gray-400 hover:rotate-3">
                        <img
                          src={
                            poster_path
                              ? `https://image.tmdb.org/t/p/w500/${poster_path}`
                              : "https://via.placeholder.com/300x450?text=No+Poster"
                          }
                          alt={title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent transition-opacity flex flex-col justify-end p-4 rounded-lg">
                          <p className="text-gray-300 text-sm">
                            {vote_average?.toFixed(1)}
                          </p>
                          <p className="text-gray-300 text-sm">
                            {release_date}
                          </p>
                          <h3 className="text-white text-lg roboto-condensed-bold">
                            {title}
                          </h3>
                        </div>
                      </Link>
                      <button
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-sm roboto-condensed-light px-3 py-1 rounded-full hover:bg-gray-700 transition-all duration-300"
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