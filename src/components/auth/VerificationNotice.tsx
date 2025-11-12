// components/auth/VerificationNotice.tsx
import { Button } from "@/components/ui/button";

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
    <div className="space-y-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Verify your email</h2>
      </div>

      {/* Verification notice */}
      <div className="pb-4">
        <p className="text-sm text-blue-400 mb-4">
          {notice}
        </p>

        {/* Email display */}
        <div className="break-all p-3 rounded text-sm text-foreground border border-neutral-700">
          {email}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          type="button"
          onClick={onResend}
          disabled={resendLoading}
          className="flex-1"
        >
          {resendLoading ? "Resending..." : "Resend email"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1"
          disabled={resendLoading}
        >
          Back to login
        </Button>
      </div>

      {/* Close button */}
      <div className="text-center">
        <Button
          type="button"
          variant="link"
          onClick={onClose}
          className="p-0 h-auto text-foreground"
          disabled={resendLoading}
        >
          Close
        </Button>
      </div>

      {/* Help text */}
      <div className="pb-4">
        <p className="text-xs text-muted-foreground">
          If you don't see the email, check your spam folder or wait a few minutes. 
          After verifying, return here and sign in.
        </p>
      </div>
    </div>
  );
};

export default VerificationNotice;