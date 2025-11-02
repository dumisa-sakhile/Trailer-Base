// components/auth/VerificationNotice.tsx
import React from "react";

interface VerificationNoticeProps {
  notice: string;
  email: string;
  password?: string;
  resendLoading?: boolean;
  onResend: () => Promise<void> | void;
  onBack: () => void;
  onClose: () => void;
}

const VerificationNotice: React.FC<VerificationNoticeProps> = ({
  notice,
  email,
  resendLoading = false,
  onResend,
  onBack,
  onClose,
}) => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-3 text-white">Verify your email</h3>
      <p className="text-sm text-neutral-300 mb-4">
        {notice}
      </p>

      <div className="mb-4 break-all bg-[rgba(255,255,255,0.03)] p-3 rounded text-sm text-white">{email}</div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onResend}
          disabled={resendLoading}
          className={`py-2 px-4 rounded-lg w-full sm:w-auto ${resendLoading ? "opacity-50 cursor-not-allowed bg-gray-600" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
        >
          {resendLoading ? "Resending..." : "Resend email"}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="py-2 px-4 rounded-lg w-full sm:w-auto bg-transparent border border-neutral-700 text-neutral-200"
        >
          Back to login
        </button>

        <button
          type="button"
          onClick={onClose}
          className="py-2 px-4 rounded-lg w-full sm:w-auto bg-neutral-800 text-neutral-200"
        >
          Close
        </button>
      </div>

      <p className="text-xs text-neutral-400 mt-4">
        If you don't see the email, check your spam folder or wait a few minutes. After verifying, return here and sign in.
      </p>
    </div>
  );
};

export default VerificationNotice;