// components/auth/VerificationSent.tsx
import React from "react";

interface Props {
  email: string;
  isResending?: boolean;
  onResend: () => Promise<void> | void;
  onBackToLogin: () => void;
}

const VerificationSent: React.FC<Props> = ({ email, isResending, onResend, onBackToLogin }) => {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Verification email sent</h3>
      <p className="mb-4 text-sm text-neutral-300">
        We sent a verification / magic link to:
      </p>
      <div className="mb-6 break-all bg-[rgba(255,255,255,0.03)] p-3 rounded text-sm">{email}</div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onResend}
          disabled={isResending}
          className={`py-2 px-4 rounded-lg w-full sm:w-auto ${isResending ? "opacity-50 cursor-not-allowed bg-gray-600" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
        >
          {isResending ? "Resending..." : "Resend email"}
        </button>

        <button
          type="button"
          onClick={onBackToLogin}
          className="py-2 px-4 rounded-lg w-full sm:w-auto bg-transparent border border-neutral-700 text-neutral-200"
        >
          Back to login
        </button>
      </div>
    </div>
  );
};

export default VerificationSent;