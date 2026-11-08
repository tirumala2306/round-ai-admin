export { demoCredentialRecords } from "@/features/auth/demo-credentials";
export { forgotPasswordSchema, resetPasswordSchema, signInSchema } from "@/features/auth/schema";
export type { ForgotPasswordValues, ResetPasswordValues, SignInValues } from "@/features/auth/schema";
export {
  authenticateDemoUser,
  hasPermission,
  hashDemoPassword,
  isAdminRole,
  requestDemoPasswordReset,
  resolveAuthContext,
  reviewDemoPasswordReset,
} from "@/features/auth/auth-service";
export { endDemoSession, startDemoSession, useAuthSession } from "@/features/auth/session";
export { adminRoleNames } from "@/features/auth/types";
export type { AuthContext, DemoResetResult, DemoSignInResult } from "@/features/auth/types";
