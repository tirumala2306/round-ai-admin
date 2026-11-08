import type { KnowledgeWriteResult } from "@/features/knowledge-base/types";
import { claimOrganizationWrite, releaseOrganizationWrite } from "@/features/organizations/demo-store";
import { showOrganizationToast } from "@/features/organizations/toast-store";

export function saveKnowledgeResult<T>(result: KnowledgeWriteResult<T>, success: string) {
  releaseOrganizationWrite();
  if (!result.ok) {
    showOrganizationToast(result.message);
    return false;
  }
  showOrganizationToast(success);
  return true;
}

export function beginKnowledgeChange() {
  if (!claimOrganizationWrite()) {
    showOrganizationToast("Another sample change is still open.");
    return false;
  }
  return true;
}
