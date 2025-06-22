import { useState, useEffect } from "react";
import { updateProfile } from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { db } from "@/config/firebase";
import { motion } from "framer-motion";

interface UserData {
  username?: string;
  gender?: string;
}

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
    profileMutation.mutate({ username: newUsername, gender });
  };

  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  if (!isShowing) return null;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <motion.div
        variants={containerVariants}
        className="relative w-full max-w-md bg-[#1C1C1E] text-white rounded-2xl shadow-xl p-6 md:p-8">
        <motion.button
          variants={itemVariants}
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
        </motion.button>

        <motion.div variants={containerVariants} className="text-center">
          <motion.h2
            variants={itemVariants}
            className="text-2xl max-sm:text-xl font-semibold mb-2">
            Enter your
            <br />
            profile details
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-sm text-gray-400 mb-6">
            Please fill in your username and gender to complete your profile.
          </motion.p>
        </motion.div>

        {error && (
          <motion.div
            variants={itemVariants}
            className="text-red-300 text-sm font-medium mb-5 p-3 rounded-md bg-[rgba(255,75,75,0.15)] backdrop-blur-sm border border-[rgba(255,75,75,0.25)] text-center">
            {error}
          </motion.div>
        )}

        <motion.form
          variants={containerVariants}
          onSubmit={handleSubmit}
          className="space-y-5">
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div variants={itemVariants}>
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
            </motion.div>

            <motion.div variants={itemVariants}>
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
            </motion.div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="flex justify-end gap-3 pt-4">
            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={profileMutation.isPending}
              className="bg-white text-black font-semibold px-5 py-2 rounded-full hover:opacity-90 transition-all">
              {profileMutation.isPending ? "Updating..." : "Done"}
            </motion.button>
            <motion.button
              variants={itemVariants}
              type="button"
              onClick={hide}
              className="text-sm text-gray-400 hover:text-white px-4 py-2 rounded-full transition">
              Cancel
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>
    </motion.div>
  );
};

export default EditProfileForm;
