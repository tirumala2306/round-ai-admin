import { demoCredentialRecords, demoPasswordPrefix } from "@/features/auth/demo-credentials";
import { adminRoleNames, type AuthContext, type DemoResetResult, type DemoSignInResult } from "@/features/auth/types";
import type { OrganizationDirectory } from "@/features/organizations/types";

const invalidCredentials = "Those demo credentials were not recognized.";
const notAdmin = "This sample account is not a hospital administrator.";

export function isAdminRole(roleName: string) {
  return adminRoleNames.some((name) => name === roleName);
}

export function resolveAuthContext(
  directory: OrganizationDirectory,
  userId: string,
): AuthContext | undefined {
  const user = directory.users.find((item) => item.id === userId);
  if (!user) {
    return undefined;
  }

  const role = directory.roles.find((item) => item.name === user.role);
  const organization = directory.organizations.find((item) => item.id === user.organizationId);

  return {
    user,
    organizationName: organization?.name ?? "Unknown organization",
    roleName: user.role,
    role,
    permissionIds: role?.permissionIds ?? [],
  };
}

export function hasPermission(context: AuthContext, permissionId: string) {
  return context.permissionIds.includes(permissionId);
}

export async function authenticateDemoUser(
  directory: OrganizationDirectory,
  email: string,
  password: string,
): Promise<DemoSignInResult> {
  const normalized = email.trim().toLowerCase();
  const user = directory.users.find((item) => item.email.toLowerCase() === normalized);
  const credential = demoCredentialRecords.find((item) => item.userId === user?.id);
  const passwordHash = await hashDemoPassword(password);

  if (!user || !credential || !hashesMatch(passwordHash, credential.passwordHash)) {
    return { ok: false, reason: "invalid", message: invalidCredentials };
  }

  if (!isAdminRole(user.role)) {
    return { ok: false, reason: "not-admin", message: notAdmin };
  }

  return { ok: true, userId: user.id };
}

export function requestDemoPasswordReset(email: string): DemoResetResult {
  const normalized = email.trim();
  if (normalized.length === 0) {
    return { ok: false, message: "Enter an email address." };
  }

  return {
    ok: true,
    message:
      "Reset request kept in this browser only. No email was sent, and no account was changed.",
  };
}

export function reviewDemoPasswordReset(
  password: string,
  confirmation: string,
): DemoResetResult {
  if (password.length < 8) {
    return { ok: false, message: "Use at least 8 characters." };
  }

  if (password !== confirmation) {
    return { ok: false, message: "Enter the same password in both fields." };
  }

  return {
    ok: true,
    message:
      "Password check completed in this browser. The new password was not saved, and no reset token was verified.",
  };
}

export async function hashDemoPassword(password: string) {
  const encoded = new TextEncoder().encode(`${demoPasswordPrefix}${password}`);
  const digest = globalThis.crypto?.subtle
    ? await globalThis.crypto.subtle.digest("SHA-256", encoded)
    : sha256(encoded);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function sha256(data: Uint8Array) {
  const encoded = data.length * 8;
  const paddedLength = Math.ceil((data.length + 9) / 64) * 64;
  const block = new Uint8Array(paddedLength);
  block.set(data);
  block[data.length] = 0x80;
  const view = new DataView(block.buffer);
  view.setUint32(paddedLength - 8, Math.floor(encoded / 0x100000000));
  view.setUint32(paddedLength - 4, encoded);

  const words = new Uint32Array(64);
  let a0 = 0x6a09e667;
  let b0 = 0xbb67ae85;
  let c0 = 0x3c6ef372;
  let d0 = 0xa54ff53a;
  let e0 = 0x510e527f;
  let f0 = 0x9b05688c;
  let g0 = 0x1f83d9ab;
  let h0 = 0x5be0cd19;

  for (let offset = 0; offset < block.length; offset += 64) {
    for (let index = 0; index < 16; index += 1) {
      words[index] = view.getUint32(offset + index * 4);
    }
    for (let index = 16; index < 64; index += 1) {
      const s0 = rotateRight(words[index - 15], 7) ^ rotateRight(words[index - 15], 18) ^ (words[index - 15] >>> 3);
      const s1 = rotateRight(words[index - 2], 17) ^ rotateRight(words[index - 2], 19) ^ (words[index - 2] >>> 10);
      words[index] = (words[index - 16] + s0 + words[index - 7] + s1) >>> 0;
    }

    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;
    let e = e0;
    let f = f0;
    let g = g0;
    let h = h0;

    for (let index = 0; index < 64; index += 1) {
      const s1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
      const choice = (e & f) ^ (~e & g);
      const temp1 = (h + s1 + choice + sha256Constants[index] + words[index]) >>> 0;
      const s0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
      const majority = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + majority) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    a0 = (a0 + a) >>> 0;
    b0 = (b0 + b) >>> 0;
    c0 = (c0 + c) >>> 0;
    d0 = (d0 + d) >>> 0;
    e0 = (e0 + e) >>> 0;
    f0 = (f0 + f) >>> 0;
    g0 = (g0 + g) >>> 0;
    h0 = (h0 + h) >>> 0;
  }

  const digest = new Uint8Array(32);
  const digestView = new DataView(digest.buffer);
  [a0, b0, c0, d0, e0, f0, g0, h0].forEach((value, index) => digestView.setUint32(index * 4, value));
  return digest;
}

function rotateRight(value: number, bits: number) {
  return (value >>> bits) | (value << (32 - bits));
}

const sha256Constants = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function hashesMatch(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}
