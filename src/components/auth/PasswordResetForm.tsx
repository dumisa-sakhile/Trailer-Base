// components/auth/PasswordResetForm.tsx
import React from "react";

interface PasswordResetFormProps {
  email: string;
  setEmail: (email: string) => void;
  isLoading: boolean;
  error: string | null;
  onSubmit: (e?: React.FormEvent) => void;
  onCancel: () => void;
}

const PasswordResetForm: React.FC<PasswordResetFormProps> = ({
  email,
  setEmail,
  isLoading,
  onSubmit,
  onCancel,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm mb-2" htmlFor="reset-email">
          Email
        </label>
        <input
          type="email"
          id="reset-email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-[rgba(255,255,255,0.1)] text-white py-3 px-4 rounded-lg focus:outline-none text-sm"
          
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-2 px-4 rounded-lg bg-blue-600 text-white"
        >
          {isLoading ? "Sending..." : "Send reset email"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 px-4 rounded-lg bg-neutral-700 text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default PasswordResetForm;