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

          await setDoc(
            doc(db, "users", user.uid),
            {
              name,
              email: user.email,
              createdAt: new Date().toISOString(),
            },
            { merge: true }
          );

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

        await setDoc(
          doc(db, "users", user.uid),
          {
            name,
            email: user.email,
            createdAt: new Date().toISOString(),
          },
          { merge: true }
        );

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
        className="relative z-10 w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181a20] via-[#23272f] to-[#181a20]">
        <motion.div
          variants={containerVariants}
          className="bg-[#23272f] border border-white/10 shadow-2xl p-8 rounded-2xl w-full max-w-[400px] flex flex-col items-center">
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center mb-6">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="#2563eb" />
              <path
                d="M8 12l2.5 2.5L16 9"
                stroke="#fff"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
          <motion.h2
            variants={itemVariants}
            className="text-2xl font-bold mb-4 text-white text-center">
            Verifying Your Sign-In
          </motion.h2>
          {isLoading ? (
            <motion.div
              variants={itemVariants}
              className="text-blue-400 text-center">
              Verifying your sign-in link...
            </motion.div>
          ) : error ? (
            <>
              <motion.div
                variants={itemVariants}
                className="text-red-500 text-sm mb-4 text-center">
                {error}
              </motion.div>
              <motion.div variants={itemVariants} className="mb-4 w-full">
                <label
                  className="block text-sm mb-2 text-white"
                  htmlFor="email">
                  Enter your email to continue
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  className="w-full bg-white/10 text-white py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </motion.div>
              <motion.button
                variants={itemVariants}
                onClick={handleManualSignIn}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50">
                {isLoading ? "Verifying..." : "Verify Email"}
              </motion.button>
            </>
          ) : (
            <motion.div
              variants={itemVariants}
              className="text-green-400 text-center">
              Sign-in successful! Redirecting...
            </motion.div>
          )}
        </motion.div>
      </motion.section>
    </>
  );
}
