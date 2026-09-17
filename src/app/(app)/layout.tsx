// Lunorsoft — authenticated app layout (server guard + shared shell).

import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { TasksProvider } from "@/features/tasks/TasksProvider";
import { getSessionUser } from "@/lib/auth-server";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <TasksProvider>
      <AppShell>{children}</AppShell>
    </TasksProvider>
  );
}
