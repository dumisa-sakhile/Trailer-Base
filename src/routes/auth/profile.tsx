import { createFileRoute, Link } from "@tanstack/react-router";
import Button from "@/components/Button";
import { useState, useEffect } from "react";
import { auth, db } from "@/config/firebase";
import { onAuthStateChanged, updateEmail } from "firebase/auth";
import type { User } from "firebase/auth";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Loading from "@/components/Loading";

// Interface for bookmark data (aligned with MovieDetails.tsx)
interface Bookmark {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
}

// Modal component for editing email
function EditEmailModal({
  isShowing,
  hide,
  user,
}: {
  isShowing: boolean;
  hide: () => void;
  user: User | null;
}) {
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const emailMutation = useMutation({
    mutationFn: async (email: string) => {
      if (!user) throw new Error("Not authenticated");
      await updateEmail(user, email);
    },
    onSuccess: () => {
      toast.success("Email updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["user"] });
      setNewEmail("");
      hide();
    },
    onError: (error: any) => {
      setError(error.message || "Failed to update email");
      if (error.code === "auth/requires-recent-login") {
        toast.error("Please log in again to update your email");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setError("Please enter a valid email address");
      return;
    }
    emailMutation.mutate(newEmail);
  };

  if (!isShowing) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#222222] p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl roboto-condensed-bold text-white mb-4">
          Edit Email
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="text-white roboto-condensed-light">
              New Email
            </label>
            <input
              id="email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.1)] text-white py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(255,255,255,0.1)]"
              placeholder="Enter new email"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          <div className="flex gap-4">
            <Button
              type="submit"
              variant="primary"
              disabled={emailMutation.isPending}>
              {emailMutation.isPending ? "Updating..." : "Update Email"}
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
  const queryClient = useQueryClient();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

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
      return snapshot.docs.map((doc) => doc.data() as Bookmark);
    },
    enabled: !!user,
  });

  // Remove bookmark mutation
  const removeBookmarkMutation = useMutation({
    mutationFn: async (movieId: string) => {
      if (!user) throw new Error("Not authenticated");
      const bookmarkRef = doc(db, "users", user.uid, "bookmarks", movieId);
      await deleteDoc(bookmarkRef);
    },
    onSuccess: () => {
      toast.success("Bookmark removed!");
      queryClient.invalidateQueries({ queryKey: ["bookmarks", user?.uid] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!user) {
    return (
      <div className="w-full min-h-lvh flex items-center justify-center">
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
      <div className="w-full min-h-lvh flex items-center justify-center">
        <p className="text-red-500 text-xl roboto-condensed-light">
          Error loading bookmarks: {error.message}
        </p>
      </div>
    );
  }

  return (
    <>
      <title>Trailer Base - Profile</title>

      <div className="w-full min-h-lvh flex flex-col gap-12 py-8 px-4 md:px-10">
        <h1 className="text-4xl md:text-5xl text-left roboto-condensed-bold tracking-tight">
          Profile
        </h1>

        <section className="flex flex-col md:flex-row items-center justify-around gap-8 md:gap-12">
          <aside className="flex items-center gap-6 flex-col">
            <img
              src={user.photoURL || "https://via.placeholder.com/128?text=User"}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover"
            />
            <h3 className="roboto-condensed-light text-xl md:text-2xl text-gray-200">
              {user.email || "User"}
            </h3>
          </aside>
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            Edit Profile
          </Button>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl md:text-3xl roboto-condensed-bold mb-6">
            Your Bookmarks
          </h2>
          {bookmarks?.length === 0 ? (
            <p className="text-gray-300 text-lg roboto-condensed-light">
              No bookmarks yet. Add some movies to your bookmarks!
            </p>
          ) : (
            <div className="flex flex-wrap gap-6">
              {bookmarks?.map(
                ({ id, title, poster_path, vote_average, release_date }) => (
                  <div className="relative group" key={id}>
                    <Link
                      to="/movie/$movieId"
                      params={{ movieId: id.toString() }}
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
                          {vote_average.toFixed(1)}
                        </p>
                        <p className="text-gray-300 text-sm">{release_date}</p>
                        <h3 className="text-white text-lg roboto-condensed-bold">
                          {title}
                        </h3>
                      </div>
                    </Link>
                    <button
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-sm roboto-condensed-light px-3 py-1 rounded-full hover:bg-gray-700 transition-all duration-300"
                      onClick={() =>
                        removeBookmarkMutation.mutate(id.toString())
                      }
                      disabled={removeBookmarkMutation.isPending}>
                      Remove
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </div>

      <EditEmailModal
        isShowing={modalOpen}
        hide={() => setModalOpen(false)}
        user={user}
      />
    </>
  );
}
