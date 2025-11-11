// components/auth/SignInForm.tsx
import React from "react";
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
    <form onSubmit={onSubmit} className="space-y-4">
      <title>Sign In</title>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-4">
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 text-sm">
          <Button
            type="button"
            variant="link"
            onClick={onForgotPassword}
            className="p-0 h-auto text-primary w-full sm:w-auto text-left sm:text-center"
            disabled={isLoading}
          >
            Forgot password?
          </Button>
          <Button
            type="button"
            variant="link"
            onClick={onCreateAccount}
            className="p-0 h-auto text-green-500 w-full sm:w-auto text-left sm:text-center ml-0 sm:ml-2"
            disabled={isLoading}
          >
            Create account
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SignInForm;