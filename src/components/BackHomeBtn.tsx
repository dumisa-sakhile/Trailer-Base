import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Home, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { auth, db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import male from "/male.jpg?url";
import female from "/female.jpg?url";
import AuthDrawer from "./AuthDrawer";

const BackHomeBtn = () => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Firebase user state (manual, no react-firebase-hooks)
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Fetch user data (for gender)
  const { data: userData } = useQuery({
    queryKey: ["userData", user?.uid],
    queryFn: async () => {
      if (!user?.uid) return {};
      const userDoc = await getDoc(doc(db, "users", user.uid));
      return userDoc.exists() ? userDoc.data() : {};
    },
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000,
  });

  const getProfileImage = () => {
    if (user?.photoURL) return user.photoURL;
    if (userData?.gender === "female") return female;
    return male;
  };

  const handleProfileClick = () => {
    if (user) {
      navigate({ to: "/auth/profile" });
    } else {
      setDrawerOpen(true);
    }
  };

  return (
    <section className="absolute top-8 right-8 z-20 hidden sm:flex gap-4 pointer-events-auto">
      {/* Back Button */}
      <button
        onClick={() => window.history.back()}
        aria-label="Go back to previous page"
        className="button-style">
        <ChevronLeft className="w-5 h-5" stroke="#e5e7eb" strokeWidth={1.5} />
        <span>Back</span>
      </button>

      {/* Home Button */}
      <button
        onClick={() => navigate({ to: "/" })}
        aria-label="Go to homepage"
        className="button-style">
        <Home className="w-5 h-5" stroke="#e5e7eb" strokeWidth={1.5} />
        <span>Home</span>
      </button>

      {/* Profile Button */}
      <button
        onClick={handleProfileClick}
        aria-label="Profile"
        className="button-style flex items-center gap-2"
        disabled={loading}>
        {user ? (
          <>
            <img
              src={getProfileImage()}
              alt="Profile"
              className="w-6 h-6 rounded-full object-cover border border-blue-500"
            />
            <span>{user.displayName || user.email}</span>
          </>
        ) : (
          <>
            <User className="w-5 h-5" stroke="#e5e7eb" strokeWidth={1.5} />
            <span>Profile</span>
          </>
        )}
      </button>

      {/* Auth Drawer */}
      <AuthDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </section>
  );
};

export default BackHomeBtn;
