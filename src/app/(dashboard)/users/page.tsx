import type { Metadata } from "next";
import { UsersScreen } from "@/components/users/users-screen";
import { usersModule } from "@/features/users";

export const metadata: Metadata = {
  title: usersModule.title,
};

export default function UsersPage() {
  return <UsersScreen />;
}
