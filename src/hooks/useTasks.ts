"use client";

// Lunorsoft — task data hook. Centralises loading/error/optimistic-update
// logic so pages stay declarative. All persistence goes through services/tasks.ts.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createTask, deleteTask, getTasks, toggleTaskCompletion, updateTask } from "@/services/tasks";
import type { CreateTaskInput, Task, UpdateTaskInput } from "@/types/task";
import { ApiError } from "@/lib/api-client";

interface UseTasksResult {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  actionError: string | null;
  completingIds: Set<string>;
  justCompletedId: string | null;
  refresh: () => Promise<void>;
  addTask: (input: CreateTaskInput) => Promise<Task>;
  editTask: (id: string, input: UpdateTaskInput) => Promise<Task>;
  removeTask: (id: string) => Promise<void>;
  toggleComplete: (task: Task) => Promise<void>;
  clearActionError: () => void;
  pending: Task[];
  completed: Task[];
}

export function useTasks(): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [completingIds, setCompletingIds] = useState<Set<string>>(new Set());
  const [justCompletedId, setJustCompletedId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getTasks();
      setTasks(list);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong while loading your tasks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [refresh]);

  const addTask = useCallback(async (input: CreateTaskInput) => {
    setActionError(null);
    try {
      const task = await createTask(input);
      setTasks((prev) => [task, ...prev]);
      return task;
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Could not create the task. Please try again.";
      setActionError(msg);
      throw e;
    }
  }, []);

  const editTask = useCallback(async (id: string, input: UpdateTaskInput) => {
    setActionError(null);
    try {
      const task = await updateTask(id, input);
      setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
      return task;
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Could not save changes. Please try again.";
      setActionError(msg);
      throw e;
    }
  }, []);

  const removeTask = useCallback(async (id: string) => {
    setActionError(null);
    const snapshot = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteTask(id);
    } catch (e) {
      setTasks(snapshot); // roll back
      const msg = e instanceof ApiError ? e.message : "Could not delete the task. Please try again.";
      setActionError(msg);
      throw e;
    }
  }, [tasks]);

  const toggleComplete = useCallback(
    async (task: Task) => {
      setActionError(null);
      // Optimistic UI with rollback on failure.
      setCompletingIds((prev) => new Set(prev).add(task.id));
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t)));
      try {
        const updated = await toggleTaskCompletion(task);
        setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
        if (updated.completed) {
          setJustCompletedId(updated.id);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => setJustCompletedId(null), 1200);
        }
      } catch (e) {
        setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t))); // roll back
        const msg = e instanceof ApiError ? e.message : "Could not update the task. Please try again.";
        setActionError(msg);
      } finally {
        setCompletingIds((prev) => {
          const next = new Set(prev);
          next.delete(task.id);
          return next;
        });
      }
    },
    []
  );

  const clearActionError = useCallback(() => setActionError(null), []);

  const pending = useMemo(() => tasks.filter((t) => !t.completed), [tasks]);
  const completed = useMemo(() => tasks.filter((t) => t.completed), [tasks]);

  return {
    tasks,
    loading,
    error,
    actionError,
    completingIds,
    justCompletedId,
    refresh,
    addTask,
    editTask,
    removeTask,
    toggleComplete,
    clearActionError,
    pending,
    completed,
  };
}
