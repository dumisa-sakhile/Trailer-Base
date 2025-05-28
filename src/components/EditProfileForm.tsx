import { useState, useEffect } from "react";
import { updateProfile } from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { db } from "@/config/firebase";

// Interface for user data in Firestore
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
          <h2 className="text-2xl max-sm:text-xl font-semibold mb-2">
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
};

export default EditProfileForm;
