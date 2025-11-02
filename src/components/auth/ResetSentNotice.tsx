// components/auth/ResetSentNotice.tsx
import React from "react";

interface ResetSentNoticeProps {
  email: string;
  onBack: () => void;
  onClose: () => void;
}

const ResetSentNotice: React.FC<ResetSentNoticeProps> = ({ email, onBack, onClose }) => {
  return (
    <div className="mb-4 p-3 bg-blue-900/40 text-blue-300 rounded space-y-3">
      <div>
        Password reset email sent to <strong>{email}</strong>. Check your inbox.
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-2 px-4 rounded-lg bg-neutral-800 text-white"
        >
          Back to sign in
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2 px-4 rounded-lg bg-white text-black"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ResetSentNotice;