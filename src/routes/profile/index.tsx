import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { auth, db } from "@/config/firebase";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import MediaCard from "@/components/MediaCard";
import male from "/male.jpg?url";
import female from "/female.jpg?url";
import LoginPrompt from "@/components/LoginPrompt";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

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
  displayName?: string;
}

export const Route = createFileRoute("/profile/")({
  component: Profile,
});

// --- Utility Hook ---
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

// --- Updated EditProfileForm with shadcn/ui ---
interface EditProfileFormProps {
  isShowing: boolean;
  hide: () => void;
  user: User | null;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({
  isShowing,
  hide,
  user,
}) => {
  const queryClient = useQueryClient();
  const { data: userData } = useQuery<UserData>({
    queryKey: ["userData", user?.uid],
    queryFn: async () => {
      if (!user) return {};
      const userDoc = await getDoc(doc(db, "users", user.uid));
      return userDoc.exists() ? (userDoc.data() as UserData) : {};
    },
    enabled: !!user,
    staleTime: 0,
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
      queryClient.removeQueries({ queryKey: ["userData", user?.uid] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["userData", user?.uid] });
      setNewUsername("");
      setGender("");
      hide();
    },
    onError: (error: any) => {
      setError(error?.message || "Failed to update profile");
      if (error?.code === "auth/requires-recent-login") {
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
    if (!gender) {
      setError("Please select a gender");
      return;
    }
    profileMutation.mutate({ username: newUsername, gender });
  };

  return (
    <Dialog open={isShowing} onOpenChange={hide}>
      <DialogContent className="sm:max-w-md bg-[#1C1C1E] text-white border-0">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center font-semibold">
            Enter your profile details
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            Please fill in your username and gender to complete your profile.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="text-red-300 text-sm font-medium p-3 rounded-md bg-[rgba(255,75,75,0.15)] border border-[rgba(255,75,75,0.25)] text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm text-gray-300">
                Username*
              </label>
              <Input
                id="username"
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Your handle"
                className="bg-[#2A2A2D] border-0 text-white placeholder:text-gray-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="gender" className="text-sm text-gray-300">
                Gender*
              </label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="bg-[#2A2A2D] border-0 text-white">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className="bg-[#2A2A2D] border-0 text-white">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="submit"
              disabled={profileMutation.isPending}
              className="bg-white text-black font-semibold hover:bg-white/90"
            >
              {profileMutation.isPending ? "Updating..." : "Save"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={hide}
              className="text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// --- Confirm Sign Out Modal with shadcn/ui ---
const ConfirmSignOutModal: React.FC<{
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, onConfirm, onCancel }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md bg-white text-black border-0">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="w-4 h-4 text-red-600"
              >
                <path
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 17l5-5-5-5M21 12H9"
                />
                <path
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 19H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7"
                />
              </svg>
            </div>
            Sign out?
          </DialogTitle>
          <DialogDescription>
            You'll be signed out on this device. You can sign back in anytime.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 border-black/20 hover:bg-black/5"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            Sign Out
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// --- Fixed Skeleton Components ---
const MEDIA_CARD_WIDTH_DESKTOP = 180;
const MEDIA_CARD_WIDTH_MOBILE = 120;

const MediaCardSkeleton: React.FC = () => {
  return (
    <div className="relative w-[180px] h-[270px] max-sm:w-[120px] max-sm:h-[180px]">
      <Card className="w-full h-full rounded-2xl overflow-hidden shadow-lg bg-neutral-800 border-0 p-0">
        <CardContent className="p-0 w-full h-full">
          <div className="relative w-full h-full">
            <Skeleton className="w-full h-full rounded-2xl bg-neutral-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-90 flex flex-col justify-end p-4 max-sm:p-2 rounded-2xl">
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 bg-neutral-600 rounded" />
                <Skeleton className="h-3 w-12 bg-neutral-600 rounded max-sm:h-2" />
              </div>
              <Skeleton className="h-3 w-16 bg-neutral-600 rounded mt-1 max-sm:h-2" />
              <Skeleton className="h-4 w-24 bg-neutral-600 rounded mt-2 max-sm:h-3" />
              <Skeleton className="h-4 w-20 bg-neutral-600 rounded mt-1 max-sm:h-3" />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="absolute top-3 left-3 p-2 bg-neutral-700 rounded-full shadow-md max-sm:p-1.5 max-sm:top-2 max-sm:left-2">
        <Skeleton className="w-5 h-5 bg-neutral-600 rounded-full" />
      </div>
    </div>
  );
};

const ProfileSkeleton: React.FC = () => {
  const { width: windowWidth } = useWindowSize();

  const cardWidth = windowWidth < 640 ? MEDIA_CARD_WIDTH_MOBILE : MEDIA_CARD_WIDTH_DESKTOP;
  const cardGap = windowWidth < 640 ? 8 : 24;
  const horizontalPadding = windowWidth < 640 ? 32 : 48;

  const effectiveWidth = Math.max(0, windowWidth - horizontalPadding);
  const cardsPerRow = Math.max(1, Math.floor(effectiveWidth / (cardWidth + cardGap)));
  const numberOfSkeletons = Math.max(cardsPerRow * 2, 6);

  return (
    <motion.div
      className="w-full min-h-screen flex flex-col gap-6 py-4 px-6 mx-auto max-w-6xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Navigation Buttons Skeleton */}
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-9 w-16 bg-neutral-700 rounded-lg" />
        <Skeleton className="h-9 w-20 bg-neutral-700 rounded-lg" />
      </div>

      {/* Profile Header Skeleton */}
      <Skeleton className="h-10 bg-neutral-700 rounded w-32 mb-4" />
      
      {/* Profile Details Skeleton */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6 flex-col md:flex-row">
          <Skeleton className="w-32 h-32 rounded-full bg-neutral-700" />
          <Skeleton className="h-6 bg-neutral-600 rounded w-48" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32 bg-neutral-700 rounded-full" />
          <Skeleton className="h-10 w-28 bg-red-700 rounded-full" />
        </div>
      </section>
      
      <Separator className="bg-neutral-700" />
      
      {/* Bookmarks Section Skeleton */}
      <section className="mt-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <Skeleton className="h-8 bg-neutral-700 rounded w-48" />
          <Skeleton className="h-9 w-32 bg-neutral-700 rounded-lg" />
        </div>

        {/* Bookmarks Grid Skeleton */}
        <div className="flex flex-wrap gap-2 md:gap-6 justify-center">
          {Array.from({ length: numberOfSkeletons }).map((_, index) => (
            <MediaCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </motion.div>
  );
};

// --- Main Profile Component ---
function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "movie" | "tv">("all");
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const navigate = Route.useNavigate();

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

  // Smooth animation variants
    const pageVariants = {
      initial: { opacity: 0, y: 20 },
      animate: { 
        opacity: 1, 
        y: 0,
        transition: {
          duration: 0.6,
        }
      },
      exit: { 
        opacity: 0, 
        y: -20,
        transition: {
          duration: 0.4,
        }
      }
    };
  
    const containerVariants: Variants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.2,
        },
      },
    };
  
    const itemVariants: Variants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { 
          duration: 0.5,
        },
      },
    };
  
    const cardVariants: Variants = {
      hidden: { opacity: 0, scale: 0.9 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.4,
        },
      },
    };

  if (!user) {
    return <LoginPrompt />;
  }

  if (error) {
    return (
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        className="w-full min-h-screen flex items-center justify-center bg-[rgba(10,10,10,0.9)] backdrop-blur-sm"
      >
        <motion.p
          className="text-red-400 text-xl font-light"
        >
          Error loading bookmarks: {error?.message}
        </motion.p>
      </motion.div>
    );
  }

  return (
    <>
      <title>Trailer Base - Profile</title>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeleton"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
          >
            <ProfileSkeleton />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            className="w-full min-h-screen flex flex-col gap-6 py-4 px-6 mx-auto max-w-6xl text-neutral-200"
          >
            {/* Navigation Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-2 mb-4"
            >
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                size="sm"
                className="bg-[#333]/50 text-white border-0 hover:scale-105 transition-transform"
              >
                ← Back
              </Button>
              <Button
                onClick={() => navigate({ to: "/" })}
                variant="outline"
                size="sm"
                className="bg-[#333]/50 text-white border-0 hover:scale-105 transition-transform"
              >
                Home ⌂
              </Button>
            </motion.div>

            {/* Profile Header */}
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-4xl font-bold tracking-tight text-white"
            >
              Profile
            </motion.h1>

            {/* Profile Details */}
            <motion.section
              variants={containerVariants}
              className="flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <motion.aside
                variants={itemVariants}
                className="flex items-center gap-6 flex-col md:flex-row"
              >
                <motion.img
                  variants={itemVariants}
                  src={getFallbackImage()}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-2 border-[rgba(255,255,255,0.2)] shadow-lg"
                />
                <motion.h3
                  variants={itemVariants}
                  className="text-md sm:text-lg font-light text-white text-center md:text-left"
                >
                  {userData?.displayName ||
                    userData?.username ||
                    "Anonymous, please set a username!"}
                </motion.h3>
              </motion.aside>
              <motion.div variants={itemVariants} className="flex gap-4">
                <Button
                  onClick={() => setModalOpen(true)}
                  className="bg-[#333]/50 text-white font-semibold text-sm hover:scale-105 transition-transform"
                >
                  Edit Profile
                </Button>
                <Button
                  onClick={() => setShowSignOutModal(true)}
                  className="bg-red-600 text-white font-semibold text-sm hover:scale-105 transition-transform"
                >
                  Sign Out
                </Button>
              </motion.div>
            </motion.section>
            
            <Separator className="bg-white/10" />

            {/* Bookmarks Section */}
            <motion.section
              variants={containerVariants}
              className="mt-6"
            >
              <motion.div
                variants={containerVariants}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8"
              >
                <motion.h2
                  variants={itemVariants}
                  className="text-2xl sm:text-3xl font-bold text-white"
                >
                  Your Bookmarks
                </motion.h2>
                <motion.div variants={itemVariants}>
                  <Select value={filter} onValueChange={(value: "all" | "movie" | "tv") => setFilter(value)}>
                    <SelectTrigger className="w-32 bg-[#333]/50 border-0 text-white">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#333] border-0 text-white">
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="movie">Movies</SelectItem>
                      <SelectItem value="tv">TV Shows</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
              </motion.div>
              
              <AnimatePresence mode="wait">
                {filteredBookmarks?.length === 0 ? (
                  <motion.p
                    key="empty"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-gray-300 text-lg font-light p-4 text-center"
                  >
                    No {filter === "all" ? "bookmarks" : filter} bookmarks yet. Add
                    some movies or TV shows to your bookmarks!
                  </motion.p>
                ) : (
                  <motion.div
                    key="bookmarks"
                    layout
                    className="flex flex-wrap gap-2 md:gap-6 justify-center"
                    initial="hidden"
                    animate="visible"
                  >
                    <AnimatePresence mode="popLayout">
                      {filteredBookmarks
                        ?.filter(
                          (bookmark) => bookmark && bookmark.id && bookmark.title
                        )
                        .map((bookmark, index) => (
                          <motion.div
                            key={`${bookmark.category}-${bookmark.id}`}
                            layout
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ 
                              duration: 0.3,
                              delay: index * 0.05,
                            }}
                            className="flex-shrink-0"
                          >
                            <MediaCard
                              id={bookmark.id}
                              title={bookmark.title}
                              release_date={bookmark.release_date}
                              poster_path={bookmark.poster_path}
                              vote_average={bookmark.vote_average}
                              type={bookmark.category}
                            />
                          </motion.div>
                        ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <EditProfileForm
        isShowing={modalOpen}
        hide={() => setModalOpen(false)}
        user={user}
      />
      <ConfirmSignOutModal
        isOpen={showSignOutModal}
        onCancel={() => setShowSignOutModal(false)}
        onConfirm={async () => {
          setShowSignOutModal(false);
          await auth.signOut();
          navigate({ to: "/" });
        }}
      />
    </>
  );
}

export default Profile;