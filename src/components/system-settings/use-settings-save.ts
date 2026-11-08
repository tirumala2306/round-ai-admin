"use client";

import { useState } from "react";
import type { SystemSettingsWriteResult } from "@/features/system-settings/types";
import { claimOrganizationWrite, releaseOrganizationWrite } from "@/features/organizations/demo-store";
import { showOrganizationToast } from "@/features/organizations/toast-store";

export function useSettingsSave<T>(save: (values: T) => SystemSettingsWriteResult, success: string) {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState<T | undefined>();

  function commit(values: T) {
    if (!claimOrganizationWrite()) {
      showOrganizationToast("Another sample change is still open.");
      setConfirming(false);
      return;
    }

    try {
      const result = save(values);
      releaseOrganizationWrite();
      setConfirming(false);
      setPending(undefined);
      if (!result.ok) {
        showOrganizationToast(result.message);
        return;
      }
      showOrganizationToast(success);
    } catch {
      releaseOrganizationWrite();
      setConfirming(false);
      showOrganizationToast("This sample setting could not be saved.");
    }
  }

  function requestSave(values: T, sensitive: boolean) {
    if (sensitive) {
      setPending(values);
      setConfirming(true);
      return;
    }
    commit(values);
  }

  function confirmSave() {
    if (pending) {
      commit(pending);
    }
  }

  function cancelConfirm() {
    setConfirming(false);
    setPending(undefined);
  }

  return { confirming, requestSave, confirmSave, cancelConfirm };
}
