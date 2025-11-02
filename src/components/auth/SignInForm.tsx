// components/auth/SignInForm.tsx
import React from "react";

interface SignInFormProps {
  email: string;
  password: string;
  isLoading: boolean;
  error: string | null;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  onForgotPassword: () => void;
  onCreateAccount: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({
  email,
  password,
  isLoading,
  setEmail,
  setPassword,
  onSubmit,
  onForgotPassword,
  onCreateAccount,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm mb-2" htmlFor="email">
          Email
        </label>
        <input
          type="email"
          id="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-[rgba(255,255,255,0.1)] text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(255,255,255,0.1)] text-sm"
          
        />
      </div>

      <div>
        <label className="block text-sm mb-2" htmlFor="password">
          Password
        </label>
        <input
          type="password"
          id="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-[rgba(255,255,255,0.1)] text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(255,255,255,0.1)] text-sm"
          
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-4">
        <button
          type="submit"
          disabled={isLoading}
          className={`py-2 px-4 rounded-lg transition-all duration-200 bg-blue-600 text-white w-full sm:w-auto ${
            isLoading ? "opacity-50 cursor-not-allowed bg-gray-600 hover:bg-gray-600" : "hover:bg-blue-700"
          }`}>
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 text-sm">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-blue-400  w-full sm:w-auto text-left sm:text-center"
          >
            Forgot password?
          </button>
          <button
            type="button"
            onClick={onCreateAccount}
            className="text-green-400  w-full sm:w-auto text-left sm:text-center ml-0 sm:ml-2"
          >
            Create account
          </button>
        </div>
      </div>
    </form>
  );
};

export default SignInForm;