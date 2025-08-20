import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
// Array of background images
const bgImages = [
  "https://image.tmdb.org/t/p/w780/pN3eaCl3sqwrerU8UNdp40F2mK0.jpg",
  "https://image.tmdb.org/t/p/original//euYIwmwkmz95mnXvufEmbL6ovhZ.jpg",
  "https://image.tmdb.org/t/p/original//tpiqEVTLRz2Mq7eLq5DT8jSrp71.jpg",
];
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
  const [bgUrl] = useState(() => {
    // Pick a random image on mount
    return bgImages[Math.floor(Math.random() * bgImages.length)];
  });
  const navigate = useNavigate();

  const buttonBaseStyles =
    "w-full py-2 px-4 rounded-lg transition-all duration-200";
  const disabledStyles =
    "opacity-50 cursor-not-allowed bg-gray-600 hover:bg-gray-600";

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
        to: "/auth/profile",
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

  return (
    <>
      <title>Trailer Base - Sign In</title>
      {/* Tailwind CSS custom styles for blob animation and body background */}
     
      {/* Background Image + Gradients/Effects */}
      <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
        {/* Random background image */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url('${bgUrl}')` }}></div>
        {/* Transparent blurred overlay for readability */}
        <div
          className="absolute inset-0 w-full h-full "
          style={{
            background: "rgba(20,20,30,0.35)",
            pointerEvents: "none",
          }}></div>
        {/* Blob gradients for extra effect */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 pointer-events-none" />
      </div>
      <motion.section
        className="relative z-10 w-full min-h-[700px] flex items-center justify-center text-white overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}>
        <motion.div
          className="bg-[#222] backdrop-blur-sm ring-1 ring-[rgba(255,255,255,0.1)] p-8 rounded-lg shadow-lg w-full max-w-[400px]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}>
          <motion.h2
            className="text-2xl font-bold mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}>
            {user ? "Sign Out" : "Log In or Create an Account"}
          </motion.h2>
          {error && (
            <motion.div
              className="mb-4 text-red-500 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              aria-live="assertive">
              {error}
            </motion.div>
          )}
          {user ? (
            <motion.div
              className="mb-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}>
              <motion.p
                className="mb-4 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}>
                You are signed in as {user.email}.
              </motion.p>
              <motion.button
                onClick={handleSignOut}
                disabled={isLoading}
                className={`${buttonBaseStyles} bg-red-600 text-white ${isLoading ? disabledStyles : "hover:bg-red-700"}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}>
                {isLoading ? "Signing Out..." : "Sign Out"}
              </motion.button>
            </motion.div>
          ) : isLinkSent ? (
            <motion.div
              className="mb-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}>
              <motion.div
                className="mb-4 text-green-500 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                aria-live="polite">
                Magic link sent! Please check your email to sign in or create an
                account.
              </motion.div>
              <motion.a
                href={getEmailProviderUrl(
                  window.localStorage.getItem("emailForSignIn") || ""
                )}
                rel="noopener noreferrer"
                className={`${buttonBaseStyles} bg-blue-600 hover:bg-blue-700 text-white inline-block`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}>
                Open Email
              </motion.a>
            </motion.div>
          ) : (
            <>
              <motion.button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className={`${buttonBaseStyles} flex items-center justify-center bg-white text-black mb-4 ${isLoading ? disabledStyles : "hover:bg-gray-200"}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                aria-label="Sign in with Google">
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google Icon"
                  className="w-5 h-5 mr-2"
                />
                Sign in with Google
              </motion.button>
              <motion.div
                className="flex items-center my-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}>
                <div className="flex-grow border-t border-white/10"></div>
                <span className="mx-4 text-sm text-white">or</span>
                <div className="flex-grow border-t border-white/10"></div>
              </motion.div>
              <motion.form
                onSubmit={handleMagicLink}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}>
                <div className="mb-4">
                  <label className="block text-sm mb-2" htmlFor="email">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={handleEmailChange}
                    className="w-full bg-[rgba(255,255,255,0.1)] text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(255,255,255,0.1)] text-sm"
                    required
                    aria-invalid={!isValidEmail}
                  />
                  {!isValidEmail && email && (
                    <motion.div
                      className="text-red-500 text-sm mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      aria-live="assertive">
                      Please enter a valid email address.
                    </motion.div>
                  )}
                </div>
                <motion.button
                  type="submit"
                  disabled={isLoading || !isValidEmail || !email}
                  className={`${buttonBaseStyles} bg-blue-600 text-white mb-4 ${isLoading || !isValidEmail || !email ? disabledStyles : "hover:bg-blue-700"}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}>
                  {isLoading ? "Sending..." : "Email magic link"}
                </motion.button>
                {/* New text about benefits of creating an account */}
                <motion.p
                  className="text-center text-xs text-gray-100 mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}>
                  Create an account to bookmark your favorite movies and TV
                  shows, receive personalized recommendations, and more!
                </motion.p>
              </motion.form>
            </>
          )}
        </motion.div>
      </motion.section>
    </>
  );
}
