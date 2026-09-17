"use client";

// Lunorsoft — TaskList (grouped ticket display) + TaskFilter (All/Pending/Completed).

import { CheckCircle2, CircleDashed, LayoutGrid, Search } from "lucide-react";
import { EmptyState } from "@/components/ui";
import { Button } from "@/components/ui";
import { TaskCard } from "./TaskCard";
import { cx, isSameDay } from "@/lib/utils";
import type { Task, TaskFilterValue } from "@/types/task";

export function TaskFilter({
  value,
  counts,
  onChange,
}: {
  value: TaskFilterValue;
  counts: { all: number; pending: number; completed: number };
  onChange: (v: TaskFilterValue) => void;
}) {
  const tabs: Array<{ v: TaskFilterValue; label: string; icon: React.ReactNode; count: number }> = [
    { v: "all", label: "All", icon: <LayoutGrid className="h-4 w-4" aria-hidden />, count: counts.all },
    { v: "pending", label: "Pending", icon: <CircleDashed className="h-4 w-4" aria-hidden />, count: counts.pending },
    { v: "completed", label: "Completed", icon: <CheckCircle2 className="h-4 w-4" aria-hidden />, count: counts.completed },
  ];
  return (
    <div role="tablist" aria-label="Filter tasks" className="inline-flex rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-1 shadow-[var(--shadow-cafe)]">
      {tabs.map((t) => (
        <button
          key={t.v}
          role="tab"
          aria-selected={value === t.v}
          onClick={() => onChange(t.v)}
          className={cx(
            "inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all",
            value === t.v
              ? "bg-[var(--accent)] text-[var(--accent-ink)] shadow"
              : "text-[var(--muted)] hover:text-[var(--ink)]"
          )}
        >
          {t.icon}
          {t.label}
          <span
            className={cx(
              "rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums",
              value === t.v ? "bg-black/15 dark:bg-white/20" : "bg-[var(--surface-2)]"
            )}
          >
            {t.count}
          </span>
        </button>
      ))}
    </div>
  );
}

export function TaskSearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="relative block w-full sm:w-64">
      <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search tickets…"
        aria-label="Search tasks"
        className="input-cafe h-11 w-full rounded-xl pr-4 pl-10 text-sm"
      />
    </label>
  );
}

interface TaskListProps {
  tasks: Task[];
  completingIds: Set<string>;
  justCompletedId: string | null;
  onToggle: (t: Task) => void;
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
  emptyTitle: string;
  emptyMessage: string;
  emptyAction?: React.ReactNode;
  groupByDay?: boolean;
}

export function TaskList({
  tasks,
  completingIds,
  justCompletedId,
  onToggle,
  onEdit,
  onDelete,
  emptyTitle,
  emptyMessage,
  emptyAction,
  groupByDay = false,
}: TaskListProps) {
  if (tasks.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} action={emptyAction} />;
  }

  if (!groupByDay) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {tasks.map((t, i) => (
          <div key={t.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}>
            <TaskCard
              task={t}
              completing={completingIds.has(t.id)}
              justCompleted={justCompletedId === t.id}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>
    );
  }

  const now = new Date();
  const today: Task[] = [];
  const upcoming: Task[] = [];
  const completed: Task[] = [];
  const nodate: Task[] = [];

  for (const t of tasks) {
    if (t.completed) {
      completed.push(t);
      continue;
    }
    if (!t.dueDate) {
      nodate.push(t);
      continue;
    }
    const due = new Date(t.dueDate);
    if (isSameDay(due, now) || due < now) today.push(t);
    else upcoming.push(t);
  }

  const groups: Array<{ key: string; title: string; hint: string; items: Task[] }> = [
    { key: "today", title: "Today", hint: "Due today or overdue", items: today },
    { key: "upcoming", title: "Upcoming", hint: "Scheduled ahead", items: upcoming },
    { key: "anytime", title: "Anytime", hint: "No due date", items: nodate },
  ];

  return (
    <div className="space-y-8">
      {groups.map((g) =>
        g.items.length === 0 ? null : (
          <section key={g.key} aria-label={`${g.title} tasks`}>
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="font-display text-lg font-semibold tracking-tight">
                {g.title}{" "}
                <span className="ml-1 rounded-full bg-[var(--surface-2)] px-2 py-0.5 align-middle text-xs font-bold text-[var(--muted)] tabular-nums">
                  {g.items.length}
                </span>
              </h3>
              <p className="text-xs text-[var(--muted)]">{g.hint}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {g.items.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  completing={completingIds.has(t.id)}
                  justCompleted={justCompletedId === t.id}
                  onToggle={onToggle}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </section>
        )
      )}
      {completed.length > 0 && (
        <section aria-label="Completed tasks">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="font-display text-lg font-semibold tracking-tight">
              Completed{" "}
              <span className="ml-1 rounded-full bg-[var(--surface-2)] px-2 py-0.5 align-middle text-xs font-bold text-[var(--muted)] tabular-nums">
                {completed.length}
              </span>
            </h3>
            <p className="text-xs text-[var(--muted)]">Stamped & served</p>
          </div>
          <div className="grid gap-4 opacity-95 md:grid-cols-2">
            {completed.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                completing={completingIds.has(t.id)}
                justCompleted={justCompletedId === t.id}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function AddTaskButton({ onClick, label = "New task" }: { onClick: () => void; label?: string }) {
  return (
    <Button onClick={onClick}>
      <span aria-hidden className="text-lg leading-none">+</span> {label}
    </Button>
  );
}
