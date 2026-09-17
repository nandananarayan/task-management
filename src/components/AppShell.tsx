"use client";

// Lunorsoft — AppShell: sidebar + topbar for the authenticated Study Café.

import { CheckCircle2, Coffee, Gamepad2, LayoutList, LogOut, Menu, Plus, Sun, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "./theme";
import { useAuth } from "@/features/auth/AuthProvider";
import { useTasksContext } from "@/features/tasks/TasksProvider";
import { cx } from "@/lib/utils";

const NAV = [
  { href: "/today", label: "Today", icon: Sun, hint: "Dashboard" },
  { href: "/tasks", label: "Tasks", icon: LayoutList, hint: "All tickets" },
  { href: "/completed", label: "Completed", icon: CheckCircle2, hint: "Stamped" },
  { href: "/break", label: "Break", icon: Gamepad2, hint: "5 min" },
];

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/today" className="group flex items-center gap-2.5" aria-label="Lunorsoft home">
      <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--accent-ink)] shadow-md transition-transform group-hover:-rotate-6">
        <Coffee className="h-5 w-5" aria-hidden strokeWidth={2.2} />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="font-display block text-[17px] font-bold tracking-tight">Lunorsoft</span>
          <span className="block text-[11px] font-semibold tracking-[0.22em] text-[var(--muted)] uppercase">
            Study Café
          </span>
        </span>
      )}
    </Link>
  );
}

export function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { openCreate } = useTasksContext();
  const onNewTask = openCreate;

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl gap-6 px-4 py-4 sm:px-6 lg:px-8">
      {/* Desktop sidebar */}
      <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-64 shrink-0 flex-col rounded-3xl border border-[var(--line)] bg-[var(--surface)]/85 p-5 shadow-[var(--shadow-cafe)] backdrop-blur-md lg:flex dark:shadow-[var(--shadow-night)]">
        <Logo />
        <p className="font-display mt-4 rounded-2xl bg-[var(--surface-2)] px-4 py-3 text-[13px] leading-relaxed text-[var(--ink-soft)] italic">
          “Your table is ready. One ticket at a time.”
        </p>
        <nav aria-label="Primary" className="mt-5 space-y-1.5">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href === "/tasks" && pathname.startsWith("/tasks"));
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-semibold transition-all",
                  active
                    ? "bg-[var(--accent)] text-[var(--accent-ink)] shadow-md"
                    : "text-[var(--ink-soft)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
                )}
              >
                <item.icon className="h-5 w-5" aria-hidden />
                {item.label}
                <span className={cx("ml-auto text-[11px] font-medium", active ? "opacity-80" : "text-[var(--muted)]")}>
                  {item.hint}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-3 pt-6">
          {onNewTask && (
            <button
              onClick={onNewTask}
              className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--line)] text-sm font-semibold text-[var(--ink-soft)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <Plus className="h-4 w-4" aria-hidden /> New study ticket
            </button>
          )}
          <div className="flex items-center justify-between rounded-2xl bg-[var(--surface-2)] px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/15 text-sm font-bold text-[var(--accent)]">
                {user?.name?.charAt(0).toUpperCase() ?? "S"}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-bold">{user?.name ?? "Student"}</span>
                <span className="block truncate text-[11px] text-[var(--muted)]">{user?.email ?? ""}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <ThemeToggle compact />
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--ink)] disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              {loggingOut ? "…" : "Log out"}
            </button>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile topbar */}
        <header className="sticky top-4 z-30 flex items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)]/90 px-4 py-3 shadow-[var(--shadow-cafe)] backdrop-blur-md lg:hidden">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--ink)]"
            >
              {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </button>
          </div>
        </header>
        {menuOpen && (
          <nav aria-label="Mobile" className="mt-3 grid grid-cols-2 gap-2 lg:hidden animate-fade-in">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "flex items-center gap-2.5 rounded-2xl border border-[var(--line)] px-4 py-3.5 text-sm font-semibold",
                    active ? "bg-[var(--accent)] text-[var(--accent-ink)]" : "bg-[var(--surface)] text-[var(--ink-soft)]"
                  )}
                >
                  <item.icon className="h-4 w-4" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="col-span-2 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold text-[var(--muted)]"
            >
              <LogOut className="h-4 w-4" aria-hidden /> Log out ({user?.name?.split(" ")[0] ?? "Student"})
            </button>
          </nav>
        )}

        <main className="mt-4 flex-1 pb-24 lg:mt-2 lg:pb-12">{children}</main>

        {/* Mobile bottom nav */}
        <nav
          aria-label="Primary mobile"
          className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-4 gap-1 rounded-3xl border border-[var(--line)] bg-[var(--surface)]/95 p-2 shadow-[var(--shadow-cafe-lg)] backdrop-blur-md lg:hidden"
        >
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "flex flex-col items-center gap-1 rounded-2xl py-2.5 text-[11px] font-bold transition",
                  active ? "bg-[var(--accent)] text-[var(--accent-ink)]" : "text-[var(--muted)]"
                )}
              >
                <item.icon className="h-5 w-5" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
