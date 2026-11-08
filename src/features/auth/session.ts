"use client";

import { useSyncExternalStore } from "react";
import {
  demoSessionCookie,
  demoSessionCookieValue,
  userIdFromDemoSession,
} from "@/features/auth/session-cookie";

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function readDemoSessionUserId() {
  if (typeof document === "undefined") {
    return null;
  }

  const prefix = `${demoSessionCookie}=`;
  const entry = document.cookie.split("; ").find((part) => part.startsWith(prefix));
  if (!entry) {
    return null;
  }

  return userIdFromDemoSession(decodeURIComponent(entry.slice(prefix.length)));
}

export function startDemoSession(userId: string, remember: boolean) {
  const maxAge = remember ? "; Max-Age=1209600" : "";
  document.cookie = `${demoSessionCookie}=${encodeURIComponent(demoSessionCookieValue(userId))}; Path=/; SameSite=Lax${maxAge}`;
  emit();
}

export function endDemoSession() {
  document.cookie = `${demoSessionCookie}=; Path=/; Max-Age=0; SameSite=Lax`;
  emit();
}

function getSnapshot() {
  return readDemoSessionUserId();
}

function getServerSnapshot() {
  return null;
}

export function useAuthSession() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
