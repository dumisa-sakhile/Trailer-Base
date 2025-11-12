// components/auth/VerificationSent.tsx
import { Button } from "@/components/ui/button";

interface Props {
  email: string;
  isResending?: boolean;
  onResend: () => Promise<void> | void;
  onBackToLogin: () => void;
}

const VerificationSent: React.FC<Props> = ({ email, isResending, onResend, onBackToLogin }) => {
  return (
    <div className="space-y-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Verification email sent</h2>
      </div>

      {/* Message */}
      <div className="pb-4">
        <p className="text-sm text-blue-400 mb-3">
          We sent a verification / magic link to:
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
          disabled={isResending}
          className="flex-1"
        >
          {isResending ? "Resending..." : "Resend email"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onBackToLogin}
          className="flex-1"
        >
          Back to login
        </Button>
      </div>

      {/* Help text */}
      <div className="pb-4">
        <p className="text-xs text-muted-foreground">
          Check your inbox and click the verification link to continue. 
          If you don't see it, check your spam folder.
        </p>
      </div>
    </div>
  );
};

export default VerificationSent;