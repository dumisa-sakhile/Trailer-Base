import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { auth, db } from "../../config/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/")({
  component: RouteComponent,
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function RouteComponent() {
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isValidEmail, setIsValidEmail] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Handle magic link sign-in on component mount
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

          // Create or update user document in Firestore
          const user = auth.currentUser;
          if (user) {
            await setDoc(
              doc(db, "users", user.uid),
              {
                email: user.email,
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

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/auth/verify`, // Redirect URL for magic link verification
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", email);
      setEmail(""); // Clear email input after sending link
      setIsValidEmail(false);
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

      // Create or update user document in Firestore
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

  return (
    <>
      <title>Trailer Base - Login</title>
      <section className="w-full h-lvh flex items-center justify-center bg-black text-white">
        <div className="bg-[#222222] backdrop-blur-sm ring-1 ring-[rgba(255,255,255,0.1)] p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6">
            Welcome back to Trailer Base
          </h2>

          {/* Error Message */}
          {error && (
            <div className="mb-4 text-red-500 text-sm" aria-live="assertive">
              {error}
            </div>
          )}

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center bg-white text-black py-2 px-4 rounded-lg mb-4 hover:bg-[#e5e5e5] disabled:opacity-50"
            aria-label="Sign in with Google">
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google Icon"
              className="w-5 h-5 mr-2"
            />
            Log in with Google
          </button>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="mx-4 text-white">or</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Email Input and Magic Link Form */}
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
                className="w-full bg-[rgba(255,255,255,0.1)] text-white py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(255,255,255,0.1)]"
                required
                aria-invalid={!isValidEmail}
              />
            </div>

            {/* Magic Link Button */}
            <button
              type="submit"
              disabled={isLoading || !isValidEmail}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg mb-4 disabled:opacity-50">
              {isLoading ? "Sending..." : "Email magic link"}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-sm text-center">
            Don’t have an account yet?{" "}
            <Link
              to="/auth/sign_up"
              className="text-base font-bold text-white hover:underline">
              Sign up here
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
