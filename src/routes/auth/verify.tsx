import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { auth, db } from "../../config/firebase";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

export const Route = createFileRoute("/auth/verify")({
  component: VerifyMagicLink,
});

function VerifyMagicLink() {
  const [error, setError] = useState<string | null>(null);
  const [manualEmail, setManualEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const completeSignIn = async () => {
      if (!isSignInWithEmailLink(auth, window.location.href)) {
        const errMsg = "Invalid or expired magic link.";
        setError(errMsg);
        toast.error(errMsg);
        setIsLoading(false);
        return;
      }

      let email = window.localStorage.getItem("emailForSignIn");
      if (!email) {
        setIsLoading(false);
        return;
      }

      try {
        await signInWithEmailLink(auth, email, window.location.href);
        window.localStorage.removeItem("emailForSignIn");

        const user = auth.currentUser;
        if (user) {
          const name =
            window.localStorage.getItem("nameForSignIn") || "Anonymous";

          await setDoc(doc(db, "users", user.uid), {
            name,
            email: user.email,
            createdAt: new Date().toISOString(),
          });

          window.localStorage.removeItem("nameForSignIn");
        }

        toast.success("Successfully signed in!");
        navigate({
          to: "/",
          search: { page: 1, period: "day" },
        });
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
        setIsLoading(false);
      }
    };
    completeSignIn();
  }, [navigate]);

  const handleManualSignIn = async () => {
    if (!manualEmail) {
      const errMsg = "Please enter your email.";
      setError(errMsg);
      toast.error(errMsg);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      await signInWithEmailLink(auth, manualEmail, window.location.href);
      window.localStorage.removeItem("emailForSignIn");

      const user = auth.currentUser;
      if (user) {
        const name =
          window.localStorage.getItem("nameForSignIn") || "Anonymous";

        await setDoc(doc(db, "users", user.uid), {
          name,
          email: user.email,
          createdAt: new Date().toISOString(),
        });

        window.localStorage.removeItem("nameForSignIn");
      }

      toast.success("Successfully signed in!");
      navigate({
        to: "/auth/profile",
      });
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
      setIsLoading(false);
    }
  };

  // Animation variants for staggered entrance
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

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <>
      <title>Trailer Base - Verify</title>
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full h-lvh flex items-center justify-center bg-black text-white">
        <motion.div
          variants={containerVariants}
          className="bg-[#222222] backdrop-blur-sm ring-1 ring-[rgba(255,255,255,0.1)] p-8 rounded-lg shadow-lg w-full max-w-md">
          <motion.h2
            variants={itemVariants}
            className="text-2xl font-bold mb-6">
            Verifying Your Sign-In
          </motion.h2>
          {isLoading ? (
            <motion.div variants={itemVariants}>
              Verifying your sign-in link...
            </motion.div>
          ) : error ? (
            <>
              <motion.div
                variants={itemVariants}
                className="text-red-500 text-sm mb-4">
                {error}
              </motion.div>
              <motion.div variants={itemVariants} className="mb-4">
                <label className="block text-sm mb-2" htmlFor="email">
                  Enter your email to continue
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  className="w-full bg-[rgba(255,255,255,0.1)] text-white py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(255,255,255,0.1)]"
                />
              </motion.div>
              <motion.button
                variants={itemVariants}
                onClick={handleManualSignIn}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg disabled:opacity-50">
                {isLoading ? "Verifying..." : "Verify Email"}
              </motion.button>
            </>
          ) : (
            <motion.div variants={itemVariants}>
              Sign-in successful! Redirecting...
            </motion.div>
          )}
        </motion.div>
      </motion.section>
    </>
  );
}
