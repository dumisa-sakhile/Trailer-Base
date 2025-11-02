import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
// Confirm Sign Out Modal
const ConfirmSignOutModal: React.FC<{
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#18181b] border border-white/10 rounded-2xl shadow-xl p-8 max-w-xs w-full flex flex-col items-center text-center">
        <h3 className="text-lg font-semibold text-white mb-2">
          Confirm Sign Out
        </h3>
        <p className="text-neutral-300 mb-6">
          Are you sure you want to sign out?
        </p>
        <div className="flex gap-4 w-full">
          <button
            className="flex-1 py-2 rounded-lg bg-neutral-700 text-white hover:bg-neutral-600 transition-all"
            onClick={onCancel}
            autoFocus>
            Cancel
          </button>
          <button
            className="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all"
            onClick={onConfirm}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
import { auth, db } from "@/config/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import MediaCard from "@/components/MediaCard"; // Ensure this path is correct
import EditProfileForm from "@/components/EditProfileForm";
import male from "/male.jpg?url";
import female from "/female.jpg?url";
import LoginPrompt from "@/components/LoginPrompt"; // Import the new LoginPrompt component

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

// Custom hook to get window dimensions for responsive skeleton calculations
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

// --- Skeleton Components ---

// Defines the dimensions for MediaCard for accurate skeleton sizing
const MEDIA_CARD_WIDTH_DESKTOP = 260;

const MEDIA_CARD_WIDTH_MOBILE = 120;

const CARD_GAP_MD = 24; // md:gap-6

/**
 * MediaCardSkeleton Component
 * Renders a skeleton placeholder for a single movie/TV show card.
 * It mimics the layout and dimensions of the actual MediaCard,
 * using neutral colors and an animating pulse effect.
 */
const MediaCardSkeleton: React.FC = () => {
  return (
    <div
      className="relative w-[260px] h-[390px] max-sm:w-[120px] max-sm:h-[180px]
                    bg-neutral-800 rounded-2xl animate-pulse overflow-hidden">
      {/* Image area placeholder */}
      <div className="absolute inset-0 bg-neutral-700"></div>
      {/* Content overlay placeholder */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/40 to-transparent
                      flex flex-col justify-end p-4 max-sm:p-2">
        {/* Rating/Year placeholder */}
        <div className="h-4 w-1/3 bg-neutral-600 rounded mb-2 max-sm:h-3 max-sm:w-1/2"></div>
        {/* Title line 1 placeholder */}
        <div className="h-5 w-3/4 bg-neutral-600 rounded mb-1 max-sm:h-4 max-sm:w-2/3"></div>
        {/* Title line 2 placeholder */}
        <div className="h-5 w-1/2 bg-neutral-600 rounded max-sm:h-4 max-sm:w-1/2"></div>
      </div>
      {/* Bookmark button placeholder */}
      <div className="absolute top-3 left-3 p-2 bg-neutral-700 rounded-full shadow-md max-sm:p-1.5 max-sm:top-2 max-sm:left-2">
        <div className="w-5 h-5 bg-neutral-600 rounded-full max-sm:w-4 max-sm:h-4"></div>
      </div>
    </div>
  );
};

/**
 * ProfileSkeleton Component
 * Renders a custom skeleton loading state for the entire Profile page.
 * It mimics the layout of the profile header and the bookmarked items grid.
 */
const ProfileSkeleton: React.FC = () => {
  const { width: windowWidth } = useWindowSize();

  let cardWidth = MEDIA_CARD_WIDTH_DESKTOP;
  let cardGap = CARD_GAP_MD; // md:gap-6
  let horizontalPadding = 24 * 2; // px-6

  // Adjust for mobile screens
  if (windowWidth < 640) {
    cardWidth = MEDIA_CARD_WIDTH_MOBILE;
    cardGap = 8; // gap-2
    horizontalPadding = 16 * 2; // px-4
  }

  // Calculate number of skeletons to fill the grid based on available width
  // Aim for a few rows to clearly show the grid structure
  const effectiveWidth = Math.max(0, windowWidth - horizontalPadding);
  const cardsPerRow = Math.floor(effectiveWidth / (cardWidth + cardGap));
  const numberOfSkeletons = Math.max(cardsPerRow * 3, 9); // Show at least 3 rows, min 9 cards

  return (
    <motion.div
      className="w-full min-h-screen flex flex-col gap-6 py-4 px-6 mx-auto max-w-6xl text-neutral-200 animate-pulse"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}>
      {/* Profile Header Skeleton */}
      <div className="h-10 bg-neutral-700 rounded w-1/4 max-w-[150px] mb-4"></div>{" "}
      {/* Title placeholder */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-6">
        <aside className="flex items-center gap-6 flex-col md:flex-row">
          {/* Profile image placeholder */}
          <div className="w-32 h-32 rounded-full bg-neutral-700 border-2 border-neutral-700 shadow-lg"></div>
          {/* Username placeholder */}
          <div className="h-6 bg-neutral-600 rounded w-48"></div>
        </aside>
        <div className="flex gap-4">
          {/* Edit Profile button placeholder */}
          <div className="h-10 w-32 bg-neutral-700 rounded-full"></div>
          {/* Sign Out button placeholder */}
          <div className="h-10 w-28 bg-red-700 rounded-full"></div>
        </div>
      </section>
      <div className="border-t border-neutral-700"></div>{" "}
      {/* Divider placeholder */}
      {/* Bookmarks Section Header Skeleton */}
      <section className="mt-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          {/* Bookmarks title placeholder */}
          <div className="h-8 bg-neutral-700 rounded w-1/3 max-w-[200px]"></div>
          {/* Filter buttons placeholder */}
          <div className="flex gap-2">
            <div className="h-9 w-16 bg-neutral-700 rounded-lg"></div>
            <div className="h-9 w-16 bg-neutral-700 rounded-lg"></div>
            <div className="h-9 w-16 bg-neutral-700 rounded-lg"></div>
          </div>
        </div>

        {/* Bookmarks Grid Skeleton - now using flexbox */}
        <div className="w-full absolute left-0 flex flex-wrap gap-2 md:gap-6 justify-center mt-10">
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

  // Listen for Firebase auth check state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // No longer redirecting here, LoginPrompt handles the UI if !currentUser
    });
    return () => unsubscribe(); // Cleanup subscription
  }, []); // Removed navigate from dependency array to prevent re-runs on navigation

  // Fetch user data from Firestore
  const { data: userData } = useQuery<UserData>({
    queryKey: ["userData", user?.uid],
    queryFn: async () => {
      if (!user) return {};
      const userDoc = await getDoc(doc(db, "users", user.uid));
      return userDoc.exists() ? (userDoc.data() as UserData) : {};
    },
    enabled: !!user, // Only run query if user is logged in
  });

  // Fetch bookmarks from Firestore
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
        // Validate bookmark data structure
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
    enabled: !!user, // Only run query if user is logged in
    refetchOnMount: "always", // Always refetch when component mounts
  });

  // Refetch bookmarks when user state changes (e.g., after login)
  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [user, refetch]);

  // Filter bookmarks based on selected category
  const filteredBookmarks =
    bookmarks?.filter((bookmark) =>
      filter === "all" ? true : bookmark?.category === filter
    ) || [];

  // Determine fallback image for profile picture
  const getFallbackImage = () => {
    if (user?.photoURL) return user.photoURL;
    return userData?.gender === "female" ? female : male;
  };

  // Animation variants for staggered entrance (used for main sections)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
      },
    },
  };

  // Animation variants for individual items within sections
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // Animation variants for individual MediaCards (no stagger or whileInView)
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  // Render LoginPrompt if user is not authenticated
  if (!user) {
    return <LoginPrompt />;
  }

  // Render an error message if bookmark data fetching fails
  if (error) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full min-h-screen flex items-center justify-center bg-[rgba(10,10,10,0.9)] backdrop-blur-sm">
        <motion.p
          variants={itemVariants}
          className="text-red-400 text-xl font-light">
          Error loading bookmarks: {error?.message}
        </motion.p>
      </motion.div>
    );
  }

  return (
    <>
      <title>Trailer Base - Profile</title>

      {/* Main Profile Content */}
      {isLoading ? (
        // Show the custom ProfileSkeleton when bookmarks are loading
        <ProfileSkeleton />
      ) : (
        // Show actual profile content once bookmarks are loaded
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full min-h-screen flex flex-col gap-6 py-4 px-6 mx-auto max-w-6xl text-neutral-200">
          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Profile
          </motion.h1>

          {/* Profile Details Section */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col md:flex-row items-center justify-between gap-6">
            <motion.aside
              variants={itemVariants}
              className="flex items-center gap-6 flex-col md:flex-row">
              <motion.img
                variants={itemVariants}
                src={getFallbackImage()}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-2 border-[rgba(255,255,255,0.2)] shadow-lg"
              />
              <motion.h3
                variants={itemVariants}
                className="text-md sm:text-lg font-light text-white">
                {userData?.displayName ||
                  userData?.username ||
                  "Anonymous, please set a username!"}
              </motion.h3>
            </motion.aside>
            <motion.div variants={itemVariants} className="flex gap-4">
              <motion.button
                variants={itemVariants}
                onClick={() => setModalOpen(true)}
                className="bg-[#333]/50 backdrop-blur-md text-white font-semibold text-sm px-5 py-3 rounded-full hover:scale-105 transition-all shadow-md">
                Edit Profile
              </motion.button>
              <motion.button
                variants={itemVariants}
                onClick={() => setShowSignOutModal(true)}
                className="bg-red-600 text-white font-semibold text-sm px-5 py-3 rounded-full hover:scale-105 transition-all shadow-md">
                Sign Out
              </motion.button>
            </motion.div>
          </motion.section>
          <motion.div
            variants={itemVariants}
            className="border-t border-white/10"></motion.div>

          {/* Bookmarks Section */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-6">
            <motion.div
              variants={containerVariants}
              className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
              <motion.h2
                variants={itemVariants}
                className="text-2xl sm:text-3xl font-bold text-white">
                Your Bookmarks
              </motion.h2>
              <motion.div variants={containerVariants} className="flex gap-2">
                {["all", "movie", "tv"].map((type) => (
                  <motion.button
                    key={type}
                    variants={itemVariants}
                    onClick={() => setFilter(type as "all" | "movie" | "tv")}
                    className={`flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-lg bg-[#333]/50 backdrop-blur-md transition-colors duration-200 ease-in-out hover:scale-105 ${
                      filter === type ? "bg-white text-black" : "text-gray-100"
                    }`}
                    aria-pressed={filter === type}
                    aria-label={`Show ${
                      type === "all"
                        ? "All"
                        : type === "movie"
                          ? "Movies"
                          : "TV"
                    } bookmarks`}
                    role="button">
                    {type === "all"
                      ? "All"
                      : type === "movie"
                        ? "Movies"
                        : "TV"}
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
            {filteredBookmarks?.length === 0 ? (
              <motion.p
                variants={itemVariants}
                className="text-gray-300 text-lg font-light p-4">
                No {filter === "all" ? "bookmarks" : filter} bookmarks yet. Add
                some movies or TV shows to your bookmarks!
              </motion.p>
            ) : (
              // Using flexbox with flex-wrap and justify-center for flexible columns
              // Added flex-grow to MediaCard's parent div for better distribution
              <div className="w-full absolute left-0 flex flex-wrap gap-2 md:gap-6 justify-center mt-10">
                {filteredBookmarks
                  ?.filter(
                    (bookmark) => bookmark && bookmark.id && bookmark.title
                  )
                  .map((bookmark, index) => (
                    <motion.div
                      key={`${bookmark.category}-${bookmark.id}`}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.05 }}
                      className="flex-shrink-0" // Ensure cards don't shrink
                      style={{ minWidth: MEDIA_CARD_WIDTH_MOBILE }} // Ensure minimum width even with flex-grow
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
              </div>
            )}
          </motion.section>
        </motion.div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileForm
        isShowing={modalOpen}
        hide={() => setModalOpen(false)}
        user={user}
      />
      {/* Confirm Sign Out Modal */}
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
