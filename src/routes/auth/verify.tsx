import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { auth, db } from "../../config/firebase"; // Import db here
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; // Import Firestore methods
import { toast } from "sonner";

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
        // If email is not in localStorage, prompt the user to enter it
        setIsLoading(false);
        return;
      }

      try {
        // Complete the sign-in with email link
        await signInWithEmailLink(auth, email, window.location.href);
        window.localStorage.removeItem("emailForSignIn");

        // Get the current user from Firebase Auth
        const user = auth.currentUser;
        if (user) {
          // Retrieve the name stored during sign-up or fallback to "Anonymous"
          const name =
            window.localStorage.getItem("nameForSignIn") || "Anonymous";

          // Write user data to Firestore 'users' collection
          await setDoc(doc(db, "users", user.uid), {
            name,
            email: user.email,
            createdAt: new Date().toISOString(),
          });

          // Clean up name from localStorage
          window.localStorage.removeItem("nameForSignIn");
        }

        toast.success("Successfully signed in!");
        navigate({
          to: "/",
          search: { page: 1, period: "day" },
        }); // Redirect to home or another route
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

      // Get the current user
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

  return (
    <section className="w-full h-lvh flex items-center justify-center bg-black text-white">
      <div className="bg-[#222222] backdrop-blur-sm ring-1 ring-[rgba(255,255,255,0.1)] p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Verify Your Sign-In</h2>
        {isLoading ? (
          <div>Verifying your sign-in link...</div>
        ) : error ? (
          <>
            <div className="text-red-500 text-sm mb-4">{error}</div>
            <div className="mb-4">
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
            </div>
            <button
              onClick={handleManualSignIn}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg disabled:opacity-50">
              {isLoading ? "Verifying..." : "Verify Email"}
            </button>
          </>
        ) : (
          <div>Sign-in successful! Redirecting...</div>
        )}
      </div>
    </section>
  );
}
