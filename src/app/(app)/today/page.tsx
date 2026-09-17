"use client";

// Lunorsoft — Today: dashboard with greeting, stats, progress + today's tickets.

import { ArrowRight, CalendarCheck, CircleDashed, Coffee, ListChecks } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { Button, Card, ErrorState, LoadingState } from "@/components/ui";
import { useAuth } from "@/features/auth/AuthProvider";
import { TaskList } from "@/features/tasks/TaskList";
import { useTasksContext } from "@/features/tasks/TasksProvider";
import { formatDateLong, greetingForHour, isSameDay } from "@/lib/utils";

export default function TodayPage() {
  const { user } = useAuth();
  const {
    tasks, loading, error, refresh,
    actionError, clearActionError,
    completingIds, justCompletedId, toggleComplete,
    openCreate, openEdit, openDelete,
  } = useTasksContext();

  const now = useMemo(() => new Date(), []);
  const greeting = greetingForHour(now.getHours());
  const firstName = user?.name?.split(" ")[0] ?? "there";

  const pending = useMemo(() => tasks.filter((t) => !t.completed), [tasks]);
  const completed = useMemo(() => tasks.filter((t) => t.completed), [tasks]);

  const todaysTickets = useMemo(() => {
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    return pending.filter((t) => {
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      return isSameDay(due, now) || due < startOfToday;
    });
  }, [pending, now]);

  const completedToday = useMemo(() => {
    return completed.filter((t) => isSameDay(new Date(t.updatedAt), now));
  }, [completed, now]);

  const todayTotal = todaysTickets.length + completedToday.length;
  const todayDone = completedToday.length;
  const progress = todayTotal === 0 ? 0 : Math.round((todayDone / todayTotal) * 100);

  const upNext = useMemo(() => {
    return pending
      .filter((t) => t.dueDate && new Date(t.dueDate) > now && !isSameDay(new Date(t.dueDate), now))
      .sort((a, b) => +new Date(a.dueDate!) - +new Date(b.dueDate!))
      .slice(0, 2);
  }, [pending, now]);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--muted)]">
            <Coffee className="h-4 w-4" aria-hidden /> {formatDateLong(now)}
          </p>
          <h1 className="font-display mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            {greeting}, {firstName}.
          </h1>
          <p className="mt-1 text-[15px] text-[var(--ink-soft)]">Your table is ready.</p>
        </div>
        <Button onClick={openCreate} size="lg">
          <span aria-hidden className="text-lg leading-none">+</span> New task
        </Button>
      </div>

      {actionError && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-2xl border border-[#b3402e]/25 bg-[#b3402e]/8 px-4 py-3 text-sm font-medium text-[#8f3423] dark:border-[#e88a76]/25 dark:bg-[#e88a76]/10 dark:text-[#e88a76]">
          <span>{actionError}</span>
          <button onClick={clearActionError} className="cursor-pointer rounded-lg px-2 py-1 font-bold hover:bg-black/5 dark:hover:bg-white/10" aria-label="Dismiss error">
            ×
          </button>
        </div>
      )}

      {loading ? (
        <LoadingState label="Loading your table…" />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <>
          {/* Stats */}
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: ListChecks, label: "Total tickets", value: tasks.length, hint: "on your table" },
              { icon: CircleDashed, label: "Pending", value: pending.length, hint: "to serve" },
              { icon: CalendarCheck, label: "Completed", value: completed.length, hint: "stamped" },
            ].map((s) => (
              <Card key={s.label} className="flex items-center gap-4 p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)]/12 text-[var(--accent)]">
                  <s.icon className="h-5.5 w-5.5" aria-hidden />
                </span>
                <span>
                  <span className="font-display block text-2xl leading-none font-bold tabular-nums">{s.value}</span>
                  <span className="mt-1 block text-[13px] font-semibold text-[var(--ink-soft)]">
                    {s.label} <span className="font-normal text-[var(--muted)]">· {s.hint}</span>
                  </span>
                </span>
              </Card>
            ))}
          </div>

          {/* Today's progress */}
          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold">Today&apos;s progress</h2>
                <p className="text-[13px] text-[var(--muted)]">
                  {todayTotal === 0
                    ? "Nothing due today — enjoy the calm, or get ahead."
                    : `${todayDone} of ${todayTotal} due tickets served`}
                </p>
              </div>
              <span className="font-display text-3xl font-bold tabular-nums">{progress}%</span>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-[var(--surface-2)]" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Today's task progress">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </Card>

          {/* Today's tickets */}
          <section aria-label="Today's tasks">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold tracking-tight">Due today</h2>
              <Link href="/tasks" className="inline-flex items-center gap-1 text-sm font-bold text-[var(--accent)] hover:underline">
                All tickets <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <TaskList
              tasks={todaysTickets}
              completingIds={completingIds}
              justCompletedId={justCompletedId}
              onToggle={toggleComplete}
              onEdit={openEdit}
              onDelete={openDelete}
              emptyTitle="Your table is clear."
              emptyMessage="Nothing due today. Add a ticket for what matters most, or enjoy a quiet café moment."
              emptyAction={<Button onClick={openCreate}>Add today&apos;s first task</Button>}
            />
          </section>

          {/* Up next */}
          {upNext.length > 0 && (
            <section aria-label="Up next">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-xl font-bold tracking-tight">Up next</h2>
                <Link href="/tasks" className="inline-flex items-center gap-1 text-sm font-bold text-[var(--accent)] hover:underline">
                  View all <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
              <TaskList
                tasks={upNext}
                completingIds={completingIds}
                justCompletedId={justCompletedId}
                onToggle={toggleComplete}
                onEdit={openEdit}
                onDelete={openDelete}
                emptyTitle=""
                emptyMessage=""
              />
            </section>
          )}
        </>
      )}
    </div>
  );
}
