"use client";

// Lunorsoft — Tasks: full ticket board with All/Pending/Completed filtering + search.

import { useMemo, useState } from "react";
import { Button, ErrorState, LoadingState } from "@/components/ui";
import { TaskFilter, TaskList, TaskSearch } from "@/features/tasks/TaskList";
import { useTasksContext } from "@/features/tasks/TasksProvider";
import type { TaskFilterValue } from "@/types/task";

export default function TasksPage() {
  const {
    tasks, loading, error, refresh,
    actionError, clearActionError,
    completingIds, justCompletedId, toggleComplete,
    openCreate, openEdit, openDelete,
  } = useTasksContext();

  const [filter, setFilter] = useState<TaskFilterValue>("all");
  const [search, setSearch] = useState("");

  const counts = useMemo(
    () => ({
      all: tasks.length,
      pending: tasks.filter((t) => !t.completed).length,
      completed: tasks.filter((t) => t.completed).length,
    }),
    [tasks]
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((t) => {
      if (filter === "pending" && t.completed) return false;
      if (filter === "completed" && !t.completed) return false;
      if (q && !`${t.title} ${t.description ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [tasks, filter, search]);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold tracking-[0.22em] text-[var(--accent)] uppercase">Ticket board</p>
          <h1 className="font-display mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Tasks</h1>
          <p className="mt-1 text-[15px] text-[var(--ink-soft)]">Every ticket on your table, neatly grouped.</p>
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
        <LoadingState label="Loading tasks…" rows={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="overflow-x-auto pb-1">
              <TaskFilter value={filter} counts={counts} onChange={setFilter} />
            </div>
            <TaskSearch value={search} onChange={setSearch} />
          </div>

          <TaskList
            tasks={visible}
            completingIds={completingIds}
            justCompletedId={justCompletedId}
            onToggle={toggleComplete}
            onEdit={openEdit}
            onDelete={openDelete}
            groupByDay={filter !== "completed" && !search.trim()}
            emptyTitle={
              search.trim()
                ? "No tickets match your search."
                : filter === "completed"
                  ? "No stamped tickets yet."
                  : filter === "pending"
                    ? "Your table is clear."
                    : "No tickets yet."
            }
            emptyMessage={
              search.trim()
                ? `Nothing found for “${search.trim()}”. Try a different keyword.`
                : filter === "completed"
                  ? "Finished work will appear here, stamped and satisfying."
                  : "Pin your first study ticket to get started — small steps count."
            }
            emptyAction={
              filter !== "completed" && !search.trim() ? (
                <Button onClick={openCreate}>Create your first task</Button>
              ) : undefined
            }
          />
        </>
      )}
    </div>
  );
}
