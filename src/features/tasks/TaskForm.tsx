"use client";

// Lunorsoft — TaskForm + TaskModal + DeleteConfirmDialog.
// One consistent form is reused for both create & edit.

import { useEffect, useState, type FormEvent } from "react";
import { TriangleAlert } from "lucide-react";
import { Button, Field, InlineError, Input, Modal, Select, Textarea } from "@/components/ui";
import { datetimeLocalToISO, isoToDatetimeLocal } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";
import type { CreateTaskInput, Task, TaskPriority, UpdateTaskInput } from "@/types/task";
import { TASK_DESCRIPTION_MAX, TASK_TITLE_MAX } from "@/types/task";

export interface TaskSubmitInput {
  title: string;
  description: string | null;
  priority: TaskPriority;
  dueDate: string | null;
}

interface TaskFormProps {
  initial?: Task | null;
  submitting: boolean;
  serverError: string | null;
  serverFields?: Record<string, string>;
  onSubmit: (input: TaskSubmitInput) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

export function TaskForm({ initial, submitting, serverError, serverFields, onSubmit, onCancel, submitLabel }: TaskFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priority, setPriority] = useState<TaskPriority>(initial?.priority ?? "medium");
  const [dueDate, setDueDate] = useState(isoToDatetimeLocal(initial?.dueDate));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setTitle(initial?.title ?? "");
    setDescription(initial?.description ?? "");
    setPriority(initial?.priority ?? "medium");
    setDueDate(isoToDatetimeLocal(initial?.dueDate));
    setErrors({});
  }, [initial]);

  // Surface server-side field errors without wiping user input.
  useEffect(() => {
    if (serverFields) setErrors((prev) => ({ ...prev, ...serverFields }));
  }, [serverFields]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = "Please give your task a title.";
    else if (title.trim().length > TASK_TITLE_MAX) next.title = `Title must be ${TASK_TITLE_MAX} characters or fewer.`;
    if (description.trim().length > TASK_DESCRIPTION_MAX) next.description = `Description must be ${TASK_DESCRIPTION_MAX} characters or fewer.`;
    if (dueDate) {
      const d = new Date(dueDate);
      if (Number.isNaN(d.getTime())) next.dueDate = "Please choose a valid date.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    await onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      priority,
      dueDate: datetimeLocalToISO(dueDate),
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <InlineError message={serverError} />
      <Field label="Title" htmlFor="task-title" error={errors.title}>
        <Input
          id="task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Finish DBMS assignment"
          maxLength={TASK_TITLE_MAX + 10}
          invalid={Boolean(errors.title)}
          autoFocus
        />
        <p className="text-right text-xs text-[var(--muted)] tabular-nums">
          {title.trim().length}/{TASK_TITLE_MAX}
        </p>
      </Field>

      <Field label="Description (optional)" htmlFor="task-description" error={errors.description}>
        <Textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What needs to be done? Add notes, chapters, links…"
          invalid={Boolean(errors.description)}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Priority" htmlFor="task-priority" error={errors.priority}>
          <Select id="task-priority" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} invalid={Boolean(errors.priority)}>
            <option value="low">Low — calm pace</option>
            <option value="medium">Medium — steady</option>
            <option value="high">High — urgent</option>
          </Select>
        </Field>
        <Field label="Due date (optional)" htmlFor="task-due" error={errors.dueDate} hint="Leave empty for someday tasks.">
          <Input
            id="task-due"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            invalid={Boolean(errors.dueDate)}
          />
        </Field>
      </div>

      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

export function TaskModal({
  open,
  task,
  submitting,
  serverError,
  serverFields,
  onClose,
  onSubmit,
}: {
  open: boolean;
  task: Task | null;
  submitting: boolean;
  serverError: string | null;
  serverFields?: Record<string, string>;
  onClose: () => void;
  onSubmit: (input: TaskSubmitInput) => Promise<void>;
}) {
  const editing = Boolean(task);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit study ticket" : "New study ticket"}
      subtitle={editing ? "Update the details of your task." : "Pin a new task to your café table."}
      wide
    >
      <TaskForm
        initial={task}
        submitting={submitting}
        serverError={serverError}
        serverFields={serverFields}
        onSubmit={onSubmit}
        onCancel={onClose}
        submitLabel={editing ? "Save changes" : "Add task"}
      />
    </Modal>
  );
}

export function DeleteConfirmDialog({
  open,
  task,
  deleting,
  onClose,
  onConfirm,
}: {
  open: boolean;
  task: Task | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Delete this task?" subtitle="This action cannot be undone.">
      <div className="flex items-start gap-3 rounded-xl bg-[var(--surface-2)] p-4">
        <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#b3402e] dark:text-[#e88a76]" aria-hidden />
        <p className="text-sm leading-relaxed text-[var(--ink-soft)]">
          <span className="font-display font-semibold text-[var(--ink)]">“{task?.title}”</span> will be
          permanently removed from your table.
        </p>
      </div>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose} disabled={deleting}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={deleting}>
          Delete task
        </Button>
      </div>
    </Modal>
  );
}

/** Extract field-level errors from an ApiError for form display. */
export function apiErrorToForm(e: unknown): { message: string; fields?: Record<string, string> } {
  if (e instanceof ApiError) return { message: e.message, fields: e.fields };
  return { message: "Something went wrong. Please try again." };
}
