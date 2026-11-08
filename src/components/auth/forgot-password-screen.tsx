"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestDemoPasswordReset } from "@/features/auth/auth-service";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/features/auth/schema";

export function ForgotPasswordScreen() {
  const [confirmation, setConfirmation] = useState<string | undefined>();
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setConfirmation(undefined);
    await new Promise((resolve) => {
      setTimeout(resolve, 400);
    });
    const result = requestDemoPasswordReset(values.email);
    if (result.ok) {
      setConfirmation(result.message);
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      description="Request a demo reset. This workspace does not send email."
    >
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
          <div className="grid gap-1.5">
            <Label htmlFor="forgot-email">Email address</Label>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="username"
              aria-invalid={form.formState.errors.email ? true : undefined}
              {...form.register("email")}
            />
            {form.formState.errors.email ? (
              <p className="text-xs leading-5 text-destructive">{form.formState.errors.email.message}</p>
            ) : null}
          </div>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Requesting reset..." : "Send reset request"}
          </Button>
          <Link href="/sign-in" className="text-sm font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </form>
      )}
    </AuthShell>
  );
}
