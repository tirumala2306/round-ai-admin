/** Demo session cookie. The value is a user id, never a password. */
export const demoSessionCookie = "roundsai-demo-session";

const demoSessionPrefix = "demo.";

export function demoSessionCookieValue(userId: string) {
  return `${demoSessionPrefix}${userId}`;
}

export function userIdFromDemoSession(value: string | undefined | null) {
  if (!value?.startsWith(demoSessionPrefix)) {
    return null;
  }

  const userId = value.slice(demoSessionPrefix.length);
  return userId.length > 0 ? userId : null;
}
