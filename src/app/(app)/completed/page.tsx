"use client";

// Lunorsoft — Completed: satisfying archive of stamped tickets.

import { useMemo } from "react";
import { PartyPopper } from "lucide-react";
import { Card, ErrorState, LoadingState } from "@/components/ui";
import { TaskList } from "@/features/tasks/TaskList";
import { useTasksContext } from "@/features/tasks/TasksProvider";

export default function CompletedPage() {
  const {
    tasks, loading, error, refresh,
    completingIds, justCompletedId, toggleComplete,
    openEdit, openDelete,
  } = useTasksContext();

  const completed = useMemo(
    () =>
      tasks
        .filter((t) => t.completed)
        .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
    [tasks]
  );

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="text-[11px] font-bold tracking-[0.22em] text-[var(--accent)] uppercase">Stamped & served</p>
        <h1 className="font-display mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Completed</h1>
        <p className="mt-1 text-[15px] text-[var(--ink-soft)]">
          {completed.length === 0
            ? "Your finished work will land here."
            : `${completed.length} ${completed.length === 1 ? "ticket" : "tickets"} served. Lovely work.`}
        </p>
      </div>

      {loading ? (
        <LoadingState label="Loading completed tasks…" />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : completed.length === 0 ? (
        <TaskList
          tasks={[]}
          completingIds={completingIds}
          justCompletedId={justCompletedId}
          onToggle={toggleComplete}
          onEdit={openEdit}
          onDelete={openDelete}
          emptyTitle="Nothing stamped yet."
          emptyMessage="Complete a ticket and it will appear here — a small trophy wall for your focus."
        />
      ) : (
        <>
          <Card className="flex items-center gap-4 border-dashed p-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#dcead6] text-[#3c5a34] dark:bg-[#243024] dark:text-[#9dc08f]">
              <PartyPopper className="h-5.5 w-5.5" aria-hidden />
            </span>
            <div>
              <p className="font-display text-[17px] font-bold">Keep the streak warm</p>
              <p className="text-sm text-[var(--muted)]">
                Reopen anything you need to revisit — no judgment, just flexibility.
              </p>
            </div>
          </Card>
          <TaskList
            tasks={completed}
            completingIds={completingIds}
            justCompletedId={justCompletedId}
            onToggle={toggleComplete}
            onEdit={openEdit}
            onDelete={openDelete}
            emptyTitle=""
            emptyMessage=""
          />
        </>
      )}
    </div>
  );
}
