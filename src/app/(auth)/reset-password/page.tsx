import { Suspense } from "react";
import type { Metadata } from "next";
import { ResetPasswordScreen } from "@/components/auth/reset-password-screen";

export const metadata: Metadata = {
  title: "Reset password",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-muted-foreground">Loading reset form</p>}>
      <ResetPasswordScreen />
    </Suspense>
  );
}
