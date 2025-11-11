// components/auth/VerificationSent.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  email: string;
  isResending?: boolean;
  onResend: () => Promise<void> | void;
  onBackToLogin: () => void;
}

const VerificationSent: React.FC<Props> = ({ email, isResending, onResend, onBackToLogin }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Verification email sent</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-0">
        <p className="text-sm text-muted-foreground">
          We sent a verification / magic link to:
        </p>
        <div className="break-all bg-muted p-3 rounded text-sm text-foreground">{email}</div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            onClick={onResend}
            disabled={isResending}
            className="w-full sm:w-auto"
          >
            {isResending ? "Resending..." : "Resend email"}
          </Button>

          <Button
            type="button"
            onClick={onBackToLogin}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Back to login
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VerificationSent;