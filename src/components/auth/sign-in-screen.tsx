"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authenticateDemoUser } from "@/features/auth/auth-service";
import { signInSchema, type SignInValues } from "@/features/auth/schema";
import { startDemoSession } from "@/features/auth/session";
import { useOrganizationDirectory } from "@/features/organizations/demo-store";

export function SignInScreen() {
  const router = useRouter();
  const directory = useOrganizationDirectory();
  const [formError, setFormError] = useState<string | undefined>();
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "", remember: false },
    mode: "onTouched",
  });

  async function onSubmit(values: SignInValues) {
    setFormError(undefined);
    const result = await authenticateDemoUser(directory, values.email, values.password);
    if (!result.ok) {
      setFormError(result.message);
      return;
    }

    startDemoSession(result.userId, values.remember);
    router.replace("/dashboard");
  }

  return (
    <AuthShell title="Welcome back" description="Sign in to manage your RoundsAI workspace.">
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="grid gap-1.5">
          <Label htmlFor="sign-in-email">Email address</Label>
          <Input
            id="sign-in-email"
            type="email"
            autoComplete="username"
            aria-invalid={form.formState.errors.email ? true : undefined}
            {...form.register("email")}
          />
          {form.formState.errors.email ? (
            <p className="text-xs leading-5 text-destructive">{form.formState.errors.email.message}</p>
          ) : null}
        </div>
        <PasswordField
          id="sign-in-password"
          label="Password"
          autoComplete="current-password"
          error={form.formState.errors.password?.message}
          {...form.register("password")}
        />
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="sign-in-remember" className="flex items-center gap-2 text-sm text-foreground">
            <input
              id="sign-in-remember"
              type="checkbox"
              className="size-4 accent-primary"
              {...form.register("remember")}
            />
            Remember me
          </label>
          <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            Forgot password
          </Link>
        </div>
        {formError ? (
          <p role="alert" className="text-sm leading-5 text-destructive">
            {formError}
          </p>
        ) : null}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <div className="mt-6 rounded-lg border border-border bg-accent/70 px-3 py-2.5 text-sm leading-5">
        <p className="font-medium text-foreground">Demo credentials only</p>
        <p className="mt-1 text-muted-foreground">
          Hospital Admin: claire.doyle@harborlight-clinic.example / Harbor-Demo-2026. This sample
          directory has no Super Admin. A physician sample account is rejected.
        </p>
      </div>
    </AuthShell>
  );
}
