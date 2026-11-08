import { z } from "zod";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter an email address.")
    .refine((value) => emailPattern.test(value), "Enter a valid email address."),
  password: z.string().min(1, "Enter a password."),
  remember: z.boolean(),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter an email address.")
    .refine((value) => emailPattern.test(value), "Enter a valid email address."),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(1, "Enter a new password.").min(8, "Use at least 8 characters."),
    confirmation: z.string().min(1, "Confirm the new password."),
  })
  .superRefine((values, context) => {
    if (values.password !== values.confirmation) {
      context.addIssue({
        code: "custom",
        path: ["confirmation"],
        message: "Enter the same password in both fields.",
      });
    }
  });

export type SignInValues = z.infer<typeof signInSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
