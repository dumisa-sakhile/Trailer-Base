// components/auth/SignUpForm.tsx
import React, { useState } from "react";

interface SignUpFormProps {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
  gender: string;
  pwLengthOk: boolean;
  pwUpperOk: boolean;
  pwLowerOk: boolean;
  pwNumberOk: boolean;
  pwSpecialOk: boolean;
  pwMatch: boolean;
  isLoading: boolean;
  error: string | null;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setPasswordConfirm: (confirm: string) => void;
  setName: (name: string) => void;
  setGender: (gender: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({
  email,
  password,
  passwordConfirm,
  name,
  gender,
  pwLengthOk,
  pwUpperOk,
  pwLowerOk,
  pwNumberOk,
  pwSpecialOk,
  pwMatch,
  isLoading,
  setEmail,
  setPassword,
  setPasswordConfirm,
  setName,
  setGender,
  onSubmit,
  onBack,
}) => {
  // Add visibility state for password fields
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isFormValid =
    pwLengthOk &&
    pwUpperOk &&
    pwLowerOk &&
    pwNumberOk &&
    pwSpecialOk &&
    pwMatch &&
    !!email &&
    !!name &&
    ["male", "female"].includes(gender.toLowerCase());

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-400">Create account</div>
        <button
          type="button"
          className="text-sm text-blue-400 "
          onClick={onBack}
        >
          Back to sign in
        </button>
      </div>

      {/* Email (visible / editable on signup) */}
      <div>
        <label className="block text-sm mb-2" htmlFor="signup-email">Email</label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          
          className="w-full bg-[rgba(255,255,255,0.1)] text-white py-3 px-4 rounded-lg focus:outline-none text-sm"
        />
      </div>

      <div>
        <label className="block text-sm mb-2" htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-[rgba(255,255,255,0.1)] text-white py-3 px-4 rounded-lg focus:outline-none text-sm"
          
        />
      </div>

      <div>
        <label className="block text-sm mb-2" htmlFor="create-password">Password</label>
        <div className="relative">
          <input
            id="create-password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pr-10 bg-[rgba(255,255,255,0.1)] text-white py-3 px-4 rounded-lg focus:outline-none text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-neutral-300 hover:text-white"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm mb-2" htmlFor="confirm-password">Confirm Password</label>
        <div className="relative">
          <input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="w-full pr-10 bg-[rgba(255,255,255,0.1)] text-white py-3 px-4 rounded-lg focus:outline-none text-sm"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-neutral-300 hover:text-white"
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
          >
            {showConfirmPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {/* Password criteria */}
      <div className="text-sm text-neutral-400">
        <div className="mb-2 font-medium text-white">Password must contain:</div>
        <ul className="space-y-1">
          <li className={`text-sm ${pwLengthOk ? "text-green-400" : "text-neutral-500"}`}>• At least 8 characters</li>
          <li className={`text-sm ${pwUpperOk ? "text-green-400" : "text-neutral-500"}`}>• An uppercase letter</li>
          <li className={`text-sm ${pwLowerOk ? "text-green-400" : "text-neutral-500"}`}>• A lowercase letter</li>
          <li className={`text-sm ${pwNumberOk ? "text-green-400" : "text-neutral-500"}`}>• A number</li>
          <li className={`text-sm ${pwSpecialOk ? "text-green-400" : "text-neutral-500"}`}>• A special character</li>
          <li className={`text-sm ${pwMatch ? "text-green-400" : "text-neutral-500"}`}>• Passwords match</li>
        </ul>
      </div>

      <div>
        <div className="block text-sm mb-2">Gender (required)</div>
        <div className="flex gap-4">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="male"
              checked={gender.toLowerCase() === "male"}
              onChange={(e) => setGender(e.target.value)}
              
              className="accent-blue-600"
              aria-label="Male"
            />
            <span className="text-white">Male</span>
          </label>

          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="female"
              checked={gender.toLowerCase() === "female"}
              onChange={(e) => setGender(e.target.value)}
              className="accent-blue-600"
              aria-label="Female"
            />
            <span className="text-white">Female</span>
          </label>
        </div>
        <div className="text-xs text-neutral-400 mt-1">Select your gender (required)</div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="submit"
          disabled={isLoading || !isFormValid}
          className="flex-1 py-2 px-4 rounded-lg bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed">
          {isLoading ? "Creating..." : "Create account"}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-2 px-4 rounded-lg bg-neutral-700 text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default SignUpForm;