// components/auth/PasswordResetForm.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  error,
  onSubmit,
  onCancel,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 overflow-y-auto">
      {/* header (accessible) */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Reset password</h2>
      </div>

      {/* Error alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Email field */}
      <div className="pb-4">
        <Label htmlFor="reset-email" className="block pb-2 text-sm font-medium text-foreground">
          Email
        </Label>
        <Input
          id="reset-email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Enter your email address and we'll send you a password reset link.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? "Sending..." : "Send reset email"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default PasswordResetForm;