"use client";

// Lunorsoft — TaskCard: a "café order ticket" for a single study task.

import { CalendarClock, Check, Loader2, Pencil, Trash2, Undo2 } from "lucide-react";
import { Badge } from "@/components/ui";
import { cx, formatDueLabel, isOverdue } from "@/lib/utils";
import type { Task } from "@/types/task";

interface TaskCardProps {
  task: Task;
  completing: boolean;
  justCompleted: boolean;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskCard({ task, completing, justCompleted, onToggle, onEdit, onDelete }: TaskCardProps) {
  const overdue = isOverdue(task.dueDate, task.completed);
  const dueLabel = formatDueLabel(task.dueDate);

  return (
    <article
      className={cx(
        "card-surface group relative overflow-hidden rounded-2xl p-5 shadow-[var(--shadow-cafe)] dark:shadow-[var(--shadow-night)]",
        "transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[var(--shadow-cafe-lg)]",
        task.completed && "opacity-90",
        justCompleted && "animate-complete"
      )}
      aria-label={`Task: ${task.title}`}
    >
      {/* ticket perforation edge */}
      <div aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-[var(--accent)]/70" />
      {task.completed && (
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[var(--surface-2)]/35" />
      )}

      <div className="relative pl-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={task.priority}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
              {task.priority}
            </Badge>
            {overdue && <Badge tone="high">Overdue</Badge>}
            {task.completed && <Badge tone="success">Done</Badge>}
          </div>
          <span className="font-display hidden text-[11px] tracking-[0.2em] text-[var(--muted)] uppercase select-none sm:block">
            № {task.id.slice(0, 6)}
          </span>
        </div>

        <h3
          className={cx(
            "font-display mt-3 text-[19px] leading-snug font-semibold tracking-tight",
            task.completed && "text-[var(--muted)] line-through decoration-2"
          )}
        >
          {task.title}
        </h3>
        {task.description && (
          <p
            className={cx(
              "mt-1.5 line-clamp-2 text-sm leading-relaxed",
              task.completed ? "text-[var(--muted)]/80" : "text-[var(--ink-soft)]"
            )}
          >
            {task.description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
          {dueLabel ? (
            <span className={cx("inline-flex items-center gap-1.5 font-medium", overdue ? "text-[#b3402e] dark:text-[#e88a76]" : "text-[var(--muted)]")}>
              <CalendarClock className="h-4 w-4" aria-hidden />
              {dueLabel}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[var(--muted)]">
              <CalendarClock className="h-4 w-4" aria-hidden />
              No due date
            </span>
          )}
          {justCompleted && (
            <span className="inline-flex items-center gap-1 font-semibold text-[#3c5a34] dark:text-[#9dc08f] animate-fade-in" role="status">
              <Check className="h-4 w-4" aria-hidden /> Nicely done
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-dashed border-[var(--line)] pt-4">
          <button
            type="button"
            onClick={() => onToggle(task)}
            disabled={completing}
            className={cx(
              "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg px-3.5 text-[13px] font-semibold transition-all active:scale-[0.97] disabled:opacity-60",
              task.completed
                ? "bg-[var(--surface-2)] text-[var(--ink-soft)] hover:text-[var(--ink)]"
                : "bg-[#3c5a34] text-white hover:brightness-110 dark:bg-[#9dc08f] dark:text-[#1a2416]"
            )}
          >
            {completing ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : task.completed ? (
              <Undo2 className="h-4 w-4" aria-hidden />
            ) : (
              <Check className="h-4 w-4" aria-hidden strokeWidth={3} />
            )}
            {task.completed ? "Reopen" : "Complete"}
          </button>
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-[var(--ink-soft)] transition hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            aria-label={`Delete task: ${task.title}`}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold text-[var(--muted)] transition hover:bg-[#b3402e]/10 hover:text-[#8f3423] dark:hover:text-[#e88a76]"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete
          </button>
        </div>
      </div>
    </article>
  );
}
