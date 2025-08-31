import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { X } from "lucide-react";
import { auth, db } from "../config/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface AuthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthDrawer: React.FC<AuthDrawerProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isValidEmail, setIsValidEmail] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLinkSent, setIsLinkSent] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);

  // Drawer drag logic
  const drawerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const dragHandlers = {
    onDragStart: (_event: MouseEvent | TouchEvent, info: PanInfo) => {
      startY.current = info.point.y;
    },
    onDragEnd: (_event: MouseEvent | TouchEvent, info: PanInfo) => {
      const draggedDistance = info.point.y - startY.current;
      const threshold = (drawerRef.current?.offsetHeight || 0) * 0.18;
      if (draggedDistance > threshold) {
        onClose();
      }
    },
  };

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Automatically close the drawer when user signs in
      if (currentUser) {
        setTimeout(() => {
          onClose();
        }, 300); // short delay for UX
      }
    });
    return () => unsubscribe();
  }, [isOpen, onClose]);
  // ...existing code...
  <p className="text-center text-sm text-neutral-400 mt-4">
    Need help?{" "}
    <a
      href="https://sakhiledumisa.com"
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-400">
      Reach out to me on sakhiledumisa.com
    </a>
  </p>;
  useEffect(() => {
    if (!isOpen) return;
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
          setIsLinkSent(false);
        } catch (err: any) {
          setError(err.message);
          toast.error(err.message);
        } finally {
          setIsLoading(false);
        }
      }
    };
    verifyMagicLinkSignIn();
  }, [isOpen]);

  const validateEmail = (email: string): boolean => emailRegex.test(email);

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
      onClose();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Drawer/modal content
  return isOpen
    ? ReactDOM.createPortal(
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center poppins-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}>
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/70"
              onClick={onClose}
              aria-label="Close authentication drawer"
            />
            {/* Drawer/Modal */}
            <motion.div
              ref={drawerRef}
              className="relative w-full sm:w-[400px] bg-black md:bg-[#23272f] rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 pt-4 flex flex-col max-h-[90vh] overflow-y-auto"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 180 }}
              drag="y"
              dragElastic={0.15}
              dragMomentum={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              {...dragHandlers}>
              {/* Close Button */}
              <button
                className="hidden md:block absolute top-3 right-3 p-2 rounded-full bg-neutral-700 hover:bg-neutral-600 transition-colors"
                onClick={onClose}
                aria-label="Close"
                type="button">
                <X size={20} />
              </button>
              {/* Handle */}
              <div className="flex justify-center mb-4">
                <div className="w-10 h-1.5 rounded-full bg-neutral-500" />
              </div>
              {/* Title & Description */}
              <div className="mb-4 text-center">
                <h2 className="text-xl font-bold text-white">
                  Log In or Create an Account
                </h2>
                <p className="text-sm text-neutral-400 mt-1">
                  Sign in to bookmark favorites and get recommendations.
                </p>
              </div>
              {/* Content */}
              <div className="flex-1">
                {error && (
                  <div
                    className="mb-4 text-red-500 text-sm"
                    aria-live="assertive">
                    {error}
                  </div>
                )}
                {user ? null : isLinkSent ? (
                  <div className="mb-4 text-center">
                    <div
                      className="mb-4 text-green-500 text-sm"
                      aria-live="polite">
                      Magic link sent! Please check your email to sign in or
                      create an account.
                    </div>
                    <a
                      href={getEmailProviderUrl(
                        window.localStorage.getItem("emailForSignIn") || ""
                      )}
                      rel="noopener noreferrer"
                      className="w-full py-2 px-4 rounded-lg transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white inline-block">
                      Open Email
                    </a>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      className={`w-full py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center bg-white text-black mb-4 ${
                        isLoading
                          ? "opacity-50 cursor-not-allowed bg-gray-600 hover:bg-gray-600"
                          : "hover:bg-gray-200"
                      }`}
                      aria-label="Sign in with Google">
                      <img
                        src="https://www.google.com/favicon.ico"
                        alt="Google Icon"
                        className="w-5 h-5 mr-2"
                      />
                      Sign in with Google
                    </button>
                    <div className="flex items-center my-4">
                      <div className="flex-grow border-t border-white/10"></div>
                      <span className="mx-4 text-sm text-white">or</span>
                      <div className="flex-grow border-t border-white/10"></div>
                    </div>
                    <form onSubmit={handleMagicLink}>
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
                          <div
                            className="text-red-500 text-sm mt-2"
                            aria-live="assertive">
                            Please enter a valid email address.
                          </div>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading || !isValidEmail || !email}
                        className={`w-full py-2 px-4 rounded-lg transition-all duration-200 bg-blue-600 text-white mb-4 ${
                          isLoading || !isValidEmail || !email
                            ? "opacity-50 cursor-not-allowed bg-gray-600 hover:bg-gray-600"
                            : "hover:bg-blue-700"
                        }`}>
                        {isLoading ? "Sending..." : "Email magic link"}
                      </button>
                      <p className="text-center text-xs text-gray-100 mt-4">
                        Create an account to bookmark your favorite movies and
                        TV shows, receive personalized recommendations, and
                        more!
                      </p>
                      <p className="text-center text-sm text-neutral-400 mt-4">
                        Need help?{" "}
                        <a
                          href="https://sakhiledumisa.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400">
                          Reach out to me on sakhiledumisa.com
                        </a>
                      </p>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )
    : null;
};

export default AuthDrawer;
