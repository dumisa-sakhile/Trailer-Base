// components/auth/ResetSentNotice.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResetSentNoticeProps {
  email: string;
  onBack: () => void;
  onClose: () => void;
}

const ResetSentNotice: React.FC<ResetSentNoticeProps> = ({ email, onBack, onClose }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Password Reset</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <p className="text-sm text-muted-foreground">
          Password reset email sent to <strong>{email}</strong>. Check your inbox.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button type="button" variant="secondary" onClick={onBack} className="flex-1">
            Back to sign in
          </Button>
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResetSentNotice;