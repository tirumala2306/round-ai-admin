"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { reviewDemoPasswordReset } from "@/features/auth/auth-service";
import { resetPasswordSchema, type ResetPasswordValues } from "@/features/auth/schema";

export function ResetPasswordScreen() {
  const params = useSearchParams();
  const token = params.get("token");
  const [confirmation, setConfirmation] = useState<string | undefined>();
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmation: "" },
    mode: "onTouched",
  });

  async function onSubmit(values: ResetPasswordValues) {
    setConfirmation(undefined);
    await new Promise((resolve) => {
      setTimeout(resolve, 400);
    });
    const result = reviewDemoPasswordReset(values.password, values.confirmation);
    if (!result.ok) {
      form.setError("confirmation", { message: result.message });
      return;
    }
    setConfirmation(result.message);
  }

  return (
    <AuthShell
      title="Choose a new password"
      description="Backend token verification will run here before a password can be saved."
    >
      <p className="mb-4 text-sm leading-6 text-muted-foreground">
        {token
          ? "A reset token is attached. This demo does not verify it."
          : "No reset token is attached. This demo does not verify one."}
      </p>
      {confirmation ? (
        <div className="grid gap-4">
          <p role="status" className="rounded-lg border border-border bg-card px-3 py-3 text-sm leading-6">
            {confirmation}
          </p>
          <Button asChild>
            <Link href="/sign-in">Back to sign in</Link>
          </Button>
        </div>
      ) : (
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <PasswordField
            id="reset-password"
            label="New password"
            autoComplete="new-password"
            error={form.formState.errors.password?.message}
            {...form.register("password")}
          />
          <PasswordField
            id="reset-confirmation"
            label="Confirm password"
            autoComplete="new-password"
            error={form.formState.errors.confirmation?.message}
            {...form.register("confirmation")}
          />
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Checking password..." : "Update password"}
          </Button>
          <Link href="/sign-in" className="text-sm font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </form>
      )}
    </AuthShell>
  );
}
