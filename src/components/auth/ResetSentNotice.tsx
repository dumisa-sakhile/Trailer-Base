// components/auth/ResetSentNotice.tsx
import { Button } from "@/components/ui/button";

interface ResetSentNoticeProps {
  email: string;
  onBack: () => void;
  onClose: () => void;
}

const ResetSentNotice: React.FC<ResetSentNoticeProps> = ({ email, onBack, onClose }) => {
  return (
    <div className="space-y-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Password reset</h2>
      </div>

      {/* Success message */}
      <div className="pb-4">
        <p className="text-sm text-green-400">
          Password reset email sent to <strong className="text-foreground">{email}</strong>. 
          Please check your inbox for further instructions.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          type="button"
          onClick={onBack}
          className="flex-1"
        >
          Back to sign in
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          Close
        </Button>
      </div>
    </div>
  );
};

export default ResetSentNotice;