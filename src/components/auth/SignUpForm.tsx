// components/auth/SignUpForm.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SignUpFormProps {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
  gender: string;
  pwLengthOk: boolean;
  pwUpperOk: boolean;
  pwLowerOk: boolean;
  pwNumberOk: boolean;
  pwSpecialOk: boolean;
  pwMatch: boolean;
  isLoading: boolean;
  error: string | null;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setPasswordConfirm: (confirm: string) => void;
  setName: (name: string) => void;
  setGender: (gender: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({
  email,
  password,
  passwordConfirm,
  name,
  gender,
  pwLengthOk,
  pwUpperOk,
  pwLowerOk,
  pwNumberOk,
  pwSpecialOk,
  pwMatch,
  isLoading,
  error,
  setEmail,
  setPassword,
  setPasswordConfirm,
  setName,
  setGender,
  onSubmit,
  onBack,
}) => {
  // Add visibility state for password fields
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isFormValid =
    pwLengthOk &&
    pwUpperOk &&
    pwLowerOk &&
    pwNumberOk &&
    pwSpecialOk &&
    pwMatch &&
    !!email &&
    !!name &&
    ["male", "female"].includes(gender.toLowerCase());

  return (
    <form onSubmit={onSubmit} className="space-y-4 overflow-y-auto">
      <title>Create Account</title>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Create account</div>
        <Button
          type="button"
          variant="link"
          onClick={onBack}
          className="p-0 h-auto text-primary"
          disabled={isLoading}
        >
          Back to sign in
        </Button>
      </div>

      {/* Email (visible / editable on signup) */}
      <div>
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={isLoading}
        />
      </div>

      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div>
        <Label htmlFor="create-password">Password</Label>
        <div className="relative">
          <Input
            id="create-password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-10"
            disabled={isLoading}
          />
          {!isLoading && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full p-0 hover:bg-transparent"
              onClick={() => setShowPassword((s) => !s)}
            >
              {showPassword ? "Hide" : "Show"}
            </Button>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="pr-10"
            disabled={isLoading}
          />
          {!isLoading && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full p-0 hover:bg-transparent"
              onClick={() => setShowConfirmPassword((s) => !s)}
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </Button>
          )}
        </div>
      </div>

      {/* Password criteria */}
      <div className="text-sm">
        <div className="mb-2 font-medium text-foreground">Password must contain:</div>
        <ul className="space-y-1 list-disc pl-4">
          <li className={`text-sm ${pwLengthOk ? "text-green-400" : "text-muted-foreground"}`}>At least 8 characters</li>
          <li className={`text-sm ${pwUpperOk ? "text-green-400" : "text-muted-foreground"}`}>An uppercase letter</li>
          <li className={`text-sm ${pwLowerOk ? "text-green-400" : "text-muted-foreground"}`}>A lowercase letter</li>
          <li className={`text-sm ${pwNumberOk ? "text-green-400" : "text-muted-foreground"}`}>A number</li>
          <li className={`text-sm ${pwSpecialOk ? "text-green-400" : "text-muted-foreground"}`}>A special character</li>
          <li className={`text-sm ${pwMatch ? "text-green-400" : "text-muted-foreground"}`}>Passwords match</li>
        </ul>
      </div>

      <div>
        <Label>Gender (required)</Label>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              name="gender"
              value="male"
              checked={gender.toLowerCase() === "male"}
              onChange={(e) => setGender(e.target.value)}
              className="accent-primary h-4 w-4"
              aria-label="Male"
              disabled={isLoading}
            />
            <Label className="text-sm cursor-pointer">Male</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              name="gender"
              value="female"
              checked={gender.toLowerCase() === "female"}
              onChange={(e) => setGender(e.target.value)}
              className="accent-primary h-4 w-4"
              aria-label="Female"
              disabled={isLoading}
            />
            <Label className="text-sm cursor-pointer">Female</Label>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Select your gender (required)</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          type="submit"
          disabled={isLoading || !isFormValid}
          className="flex-1"
        >
          {isLoading ? "Creating..." : "Create account"}
        </Button>
        <Button type="button" variant="outline" onClick={onBack} className="flex-1" disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default SignUpForm;