// components/auth/SignInForm.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  error,
  setEmail,
  setPassword,
  onSubmit,
  onForgotPassword,
  onCreateAccount,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 overflow-y-auto">
      {/* header (accessible) */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Sign in</h2>
      </div>

      {/* Error alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Email field */}
      <div className="pb-4">
        <Label htmlFor="email" className="block pb-2 text-sm font-medium text-foreground">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Password field */}
      <div className="pb-4">
        <Label htmlFor="password" className="block pb-2 text-sm font-medium text-foreground">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCreateAccount}
          className="flex-1"
          disabled={isLoading}
        >
          Create account
        </Button>
      </div>

      {/* Forgot password link */}
      <div className="text-center">
        <Button
          type="button"
          variant="link"
          onClick={onForgotPassword}
          className="p-0 h-auto text-foreground"
          disabled={isLoading}
        >
          Forgot password?
        </Button>
      </div>
    </form>
  );
};

export default SignInForm;