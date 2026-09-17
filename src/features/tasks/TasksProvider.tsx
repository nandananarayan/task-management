"use client";

// Lunorsoft — shared task state for the authenticated app.
// One fetch, one modal system, consumed by sidebar + all pages.

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { DeleteConfirmDialog, TaskModal, apiErrorToForm, type TaskSubmitInput } from "./TaskForm";
import type { Task } from "@/types/task";

interface TasksContextValue extends ReturnType<typeof useTasks> {
  openCreate: () => void;
  openEdit: (t: Task) => void;
  openDelete: (t: Task) => void;
  closeModals: () => void;
}

const TasksContext = createContext<TasksContextValue | null>(null);

export function useTasksContext(): TasksContextValue {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasksContext must be used within <TasksProvider>");
  return ctx;
}

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const tasksApi = useTasks();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formFields, setFormFields] = useState<Record<string, string> | undefined>(undefined);

  const openCreate = useCallback(() => {
    setFormError(null);
    setFormFields(undefined);
    setCreateOpen(true);
  }, []);
  const openEdit = useCallback((t: Task) => {
    setFormError(null);
    setFormFields(undefined);
    setEditing(t);
  }, []);
  const openDelete = useCallback((t: Task) => setDeleting(t), []);
  const closeModals = useCallback(() => {
    if (submitting || removing) return;
    setCreateOpen(false);
    setEditing(null);
    setDeleting(null);
    setFormError(null);
    setFormFields(undefined);
  }, [submitting, removing]);

  const handleCreate = useCallback(
    async (input: TaskSubmitInput) => {
      setSubmitting(true);
      setFormError(null);
      setFormFields(undefined);
      try {
        await tasksApi.addTask({
          title: input.title,
          description: input.description ?? undefined,
          priority: input.priority,
          dueDate: input.dueDate,
        });
        setCreateOpen(false);
      } catch (e) {
        const { message, fields } = apiErrorToForm(e);
        setFormError(message);
        setFormFields(fields);
      } finally {
        setSubmitting(false);
      }
    },
    [tasksApi]
  );

  const handleEdit = useCallback(
    async (input: TaskSubmitInput) => {
      if (!editing) return;
      setSubmitting(true);
      setFormError(null);
      setFormFields(undefined);
      try {
        await tasksApi.editTask(editing.id, {
          title: input.title,
          description: input.description,
          priority: input.priority,
          dueDate: input.dueDate,
        });
        setEditing(null);
      } catch (e) {
        const { message, fields } = apiErrorToForm(e);
        setFormError(message);
        setFormFields(fields);
      } finally {
        setSubmitting(false);
      }
    },
    [editing, tasksApi]
  );

  const handleDelete = useCallback(async () => {
    if (!deleting) return;
    setRemoving(true);
    try {
      await tasksApi.removeTask(deleting.id);
      setDeleting(null);
    } catch {
      // actionError is surfaced via banner; keep dialog open state simple.
      setDeleting(null);
    } finally {
      setRemoving(false);
    }
  }, [deleting, tasksApi]);

  const value = useMemo(
    () => ({ ...tasksApi, openCreate, openEdit, openDelete, closeModals }),
    [tasksApi, openCreate, openEdit, openDelete, closeModals]
  );

  return (
    <TasksContext.Provider value={value}>
      {children}
      <TaskModal
        open={createOpen}
        task={null}
        submitting={submitting}
        serverError={formError}
        serverFields={formFields}
        onClose={closeModals}
        onSubmit={handleCreate}
      />
      <TaskModal
        open={Boolean(editing)}
        task={editing}
        submitting={submitting}
        serverError={formError}
        serverFields={formFields}
        onClose={closeModals}
        onSubmit={handleEdit}
      />
      <DeleteConfirmDialog
        open={Boolean(deleting)}
        task={deleting}
        deleting={removing}
        onClose={closeModals}
        onConfirm={handleDelete}
      />
    </TasksContext.Provider>
  );
}
