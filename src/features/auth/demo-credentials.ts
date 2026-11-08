/**
 * Demo password checks for existing sample users.
 * Values are SHA-256 hashes of `roundsai-demo:` plus the demo password.
 * Plaintext passwords are not stored on user records.
 */
export const demoCredentialRecords = [
  {
    userId: "har-user-doyle",
    passwordHash: "dbeb88cfa6deea0a6c3d2cd678759080bbdbc9328cbb6d03135cae01fcc4c435",
  },
  {
    userId: "mer-user-patel",
    passwordHash: "04d9aa48e11eae18a7a11272499e3330f2bb46d7bee0e94f7c7ea2bda64315d4",
  },
] as const;

export const demoPasswordPrefix = "roundsai-demo:";
