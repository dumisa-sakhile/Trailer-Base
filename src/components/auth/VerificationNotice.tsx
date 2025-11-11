// components/auth/VerificationNotice.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Verify your email</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <Alert>
          <AlertDescription className="text-sm text-muted-foreground mb-4">
            {notice}
          </AlertDescription>
        </Alert>

        <div className="break-all bg-muted p-3 rounded text-sm text-foreground">{email}</div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            onClick={onResend}
            disabled={resendLoading}
            className="w-full sm:w-auto"
          >
            {resendLoading ? "Resending..." : "Resend email"}
          </Button>

          <Button
            type="button"
            onClick={onBack}
            variant="outline"
            className="w-full sm:w-auto"
            disabled={resendLoading}
          >
            Back to login
          </Button>

          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            className="w-full sm:w-auto"
            disabled={resendLoading}
          >
            Close
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          If you don't see the email, check your spam folder or wait a few minutes. After verifying, return here and sign in.
        </p>
      </CardContent>
    </Card>
  );
};

export default VerificationNotice;