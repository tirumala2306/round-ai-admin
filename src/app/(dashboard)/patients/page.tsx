import type { Metadata } from "next";
import { ModuleFoundation } from "@/components/layout/module-foundation";
import { patientsModule } from "@/features/patients";

export const metadata: Metadata = {
  title: patientsModule.title,
};

export default function PatientsPage() {
  return <ModuleFoundation module={patientsModule} />;
}
