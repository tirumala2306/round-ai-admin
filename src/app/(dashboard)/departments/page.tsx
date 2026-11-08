import type { Metadata } from "next";
import { DepartmentsScreen } from "@/components/departments/departments-screen";
import { departmentsModule } from "@/features/departments";

export const metadata: Metadata = {
  title: departmentsModule.title,
};

export default function DepartmentsPage() {
  return <DepartmentsScreen />;
}
