import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/auth/sign_up")({
  component: RouteComponent,
});

function RouteComponent() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidName, setIsValidName] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(false);

  const validateName = (name : string) => {
    // Basic name validation: must be at least 2 characters
    return name.trim().length >= 2;
  };

  const validateEmail = (email : string) => {
    // Basic email validation: must contain @ and . after @
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    setIsValidName(validateName(newName));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsValidEmail(validateEmail(newEmail));
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Placeholder for sign-up logic
    console.log("Signing up with:", { name, email });
    // Replace with actual backend API call to register user
    setTimeout(() => {
      setIsLoading(false);
      alert("Sign-up successful! Check your email for confirmation.");
    }, 2000);
  };

  const handleGoogleSignIn = () => {
    // Placeholder for Google OAuth logic
    console.log("Initiating Google OAuth...");
    // Replace with actual OAuth flow
  };

  return (
    <>
      <title>Trailer Base - Sign Up</title>
      <section className="w-full h-lvh flex items-center justify-center bg-black text-white">
        <div className="bg-[#222222] backdrop-blur-sm ring-1 ring-[rgba(255,255,255,0.1)] p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6">
            Create an account on Trailer Base
          </h2>

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center bg-white text-black py-2 px-4 rounded-lg mb-4 hover:bg-[#e5e5e5]">
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
