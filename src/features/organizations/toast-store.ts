"use client";

import { useSyncExternalStore } from "react";

type OrganizationToast = {
  id: number;
  message: string;
};

let toast: OrganizationToast | null = null;
const listeners = new Set<() => void>();
let dismissTimer = 0;

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

export function showOrganizationToast(message: string) {
  const next = { id: Date.now(), message };
  toast = next;
  emit();
  window.clearTimeout(dismissTimer);
  dismissTimer = window.setTimeout(() => {
    if (toast?.id === next.id) {
      toast = null;
      emit();
    }
  }, 4000);
}

export function dismissOrganizationToast() {
  window.clearTimeout(dismissTimer);
  toast = null;
  emit();
}

export function useOrganizationToast() {
  return useSyncExternalStore(
    subscribe,
    () => toast,
    () => null,
  );
}
