import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { auth, db } from "../../config/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/sign_up")({
  component: RouteComponent,
});

function RouteComponent() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isValidName, setIsValidName] = useState<boolean>(false);
  const [isValidEmail, setIsValidEmail] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate({
          to: "/",
          search: { page: 1, period: "day" },
        });
        toast.info("You are already signed in!");
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [navigate]);

  const validateName = (name: string): boolean => {
    return name.trim().length >= 2;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    setIsValidName(validateName(newName));
    setError(null);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsValidEmail(validateEmail(newEmail));
    setError(null);
  };

  const handleSignUp = async (e: React.FormEvent) => {
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
      window.localStorage.setItem("nameForSignIn", name);
      setIsLoading(false);
      toast.success("Sign-up link sent! Check your email for confirmation.");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
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

      // Store user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: name || user.displayName || "Anonymous",
        email: user.email,
        createdAt: new Date().toISOString(),
      });

      toast.success("Successfully signed up with Google!");
      navigate({
        to: "/",
        search: { page: 1, period: "day" },
      }); // Redirect to home
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
      setIsLoading(false);
    }
  };

  return (
    <>
      <title>Trailer Base - Sign Up</title>
      <section className="w-full h-lvh flex items-center justify-center bg-black text-white">
        <div className="bg-[#222222] backdrop-blur-sm ring-1 ring-[rgba(255,255,255,0.1)] p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6">
            Create an account on Trailer Base
          </h2>

          {/* Error Message */}
          {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center bg-white text-black py-2 px-4 rounded-lg mb-4 hover:bg-[#e5e5e5] disabled:opacity-50">
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google Icon"
              className="w-5 h-5 mr-2"
            />
            Sign up with Google
          </button>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="mx-4 text-white">or</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Sign Up Form */}
          <form onSubmit={handleSignUp}>
            <div className="mb-4">
              <label className="block text-sm mb-2" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={handleNameChange}
                className="w-full bg-[rgba(255,255,255,0.1)] text-white py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(255,255,255,0.1)]"
                required
              />
            </div>

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
              />
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading || !isValidName || !isValidEmail}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg mb-4 disabled:opacity-50">
              {isLoading ? "Creating..." : "Sign Up"}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-sm text-center">
            Already have an account?{" "}
            <Link
              to="/auth"
              className="text-base font-bold text-white hover:underline">
              Log in here
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
