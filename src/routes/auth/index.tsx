import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { auth, db } from "../../config/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

export const Route = createFileRoute("/auth/")({
  component: Auth,
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Auth() {
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isValidEmail, setIsValidEmail] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLinkSent, setIsLinkSent] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        navigate({
          to: "/",
          search: { page: 1, period: "day" },
        });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const verifyMagicLinkSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        setIsLoading(true);
        const emailForSignIn = window.localStorage.getItem("emailForSignIn");

        if (!emailForSignIn) {
          setError("No email found for sign-in. Please enter your email.");
          toast.error("No email found for sign-in. Please enter your email.");
          setIsLoading(false);
          return;
        }

        try {
          await signInWithEmailLink(auth, emailForSignIn, window.location.href);
          window.localStorage.removeItem("emailForSignIn");

          const user = auth.currentUser;
          if (user) {
            await setDoc(
              doc(db, "users", user.uid),
              {
                email: user.email,
                displayName: user.displayName || "Anonymous",
                lastLogin: new Date().toISOString(),
              },
              { merge: true }
            );
          }

          toast.success("Successfully signed in!");
          navigate({
            to: "/",
            search: { page: 1, period: "day" },
          });
        } catch (err: any) {
          setError(err.message);
          toast.error(err.message);
        } finally {
          setIsLoading(false);
        }
      }
    };
    verifyMagicLinkSignIn();
  }, [navigate]);

  const validateEmail = (email: string): boolean => {
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsValidEmail(validateEmail(newEmail));
    setError(null);
  };

  const getEmailProviderUrl = (email: string): string => {
    const domain = email.split("@")[1]?.toLowerCase();
    switch (domain) {
      case "gmail.com":
        return "https://mail.google.com";
      case "outlook.com":
      case "hotmail.com":
        return "https://outlook.live.com";
      case "yahoo.com":
        return "https://mail.yahoo.com";
      default:
        return "mailto:";
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/auth/verify`,
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", email);
      setEmail("");
      setIsValidEmail(false);
      setIsLinkSent(true);
      toast.success("Magic link sent! Check your email.");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const user = result.user;
      if (user) {
        await setDoc(
          doc(db, "users", user.uid),
          {
            email: user.email,
            displayName: user.displayName || "Anonymous",
            lastLogin: new Date().toISOString(),
          },
          { merge: true }
        );
      }

      toast.success("Successfully signed in with Google!");
      navigate({
        to: "/",
        search: { page: 1, period: "day" },
      });
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      toast.success("Successfully signed out!");
      navigate({
        to: "/",
        search: { page: 1, period: "day" },
      });
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
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
      <title>Explore Movies & TV Shows</title>
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full h-lvh flex items-center justify-center bg-black text-white px-4 sm:px-0">
        <motion.div
          variants={containerVariants}
          className="bg-[#222222] backdrop-blur-sm ring-1 ring-[rgba(255,255,255,0.1)] p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-sm">
          <motion.h2
            variants={itemVariants}
            className="text-2xl font-bold mb-6">
            {user ? "Sign Out" : "Log In or Create an Account"}
          </motion.h2>

          {error && (
            <motion.div
              variants={itemVariants}
              className="mb-4 text-red-500 text-sm"
              aria-live="assertive">
              {error}
            </motion.div>
          )}

          {user ? (
            <motion.div
              variants={containerVariants}
              className="mb-4 text-center">
              <motion.p variants={itemVariants} className="mb-4 text-sm">
                You are signed in as {user.email}.
              </motion.p>
              <motion.button
                variants={itemVariants}
                onClick={handleSignOut}
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg disabled:opacity-50 text-sm">
                {isLoading ? "Signing Out..." : "Sign Out"}
              </motion.button>
            </motion.div>
          ) : isLinkSent ? (
            <motion.div
              variants={containerVariants}
              className="mb-4 text-center">
              <motion.div
                variants={itemVariants}
                className="mb-4 text-green-500 text-sm"
                aria-live="polite">
                Magic link sent! Please check your email to sign in or create an account.
              </motion.div>
              <motion.a
                variants={itemVariants}
                href={getEmailProviderUrl(
                  window.localStorage.getItem("emailForSignIn") || ""
                )}
                rel="noopener noreferrer"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg disabled:opacity-50 inline-block text-sm">
                Open Email
              </motion.a>
            </motion.div>
          ) : (
            <>
              <motion.button
                variants={itemVariants}
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center bg-white text-black py-2 px-4 rounded-lg mb-4 hover:bg-[#e5e5e5] disabled:opacity-50 text-sm"
                aria-label="Sign in with Google">
                <motion.img
                  variants={itemVariants}
                  src="https://www.google.com/favicon.ico"
                  alt="Google Icon"
                  className="w-5 h-5 mr-2"
                />
                Log/Sign up with Google
              </motion.button>

              <motion.div
                variants={itemVariants}
                className="flex items-center my-4">
                <div className="flex-grow border-t border-white/10"></div>
                <motion.span
                  variants={itemVariants}
                  className="mx-4 text-sm text-white">
                  or
                </motion.span>
                <div className="flex-grow border-t border-white/10"></div>
              </motion.div>

              <motion.form
                variants={containerVariants}
                onSubmit={handleMagicLink}>
                <motion.div variants={itemVariants} className="mb-4">
                  <label className="block text-sm mb-2" htmlFor="email">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={handleEmailChange}
                    className="w-full bg-[rgba(255,255,255,0.1)] text-white py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(255,255,255,0.1)] text-sm"
                    required
                    aria-invalid={!isValidEmail}
                  />
                </motion.div>

                <motion.button
                  variants={itemVariants}
                  type="submit"
                  disabled={isLoading || !isValidEmail}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg mb-4 disabled:opacity-50 text-sm">
                  {isLoading ? "Sending..." : "Email magic link"}
                </motion.button>
              </motion.form>
            </>
          )}
        </motion.div>
      </motion.section>
    </>
  );
}