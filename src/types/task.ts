// Lunorsoft — Task domain model.
// This is the frontend contract. It mirrors (but does not depend on)
// the PostgreSQL row shape. IDs + timestamps originate from the backend.

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  /** ISO-8601 date string, or null when no due date. */
  dueDate?: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  priority?: TaskPriority;
  dueDate?: string | null;
  completed?: boolean;
}

export type TaskFilterValue = "all" | "pending" | "completed";

export interface TaskQuery {
  filter?: TaskFilterValue;
  search?: string;
}

export const TASK_TITLE_MAX = 140;
export const TASK_DESCRIPTION_MAX = 2000;

export function isTaskPriority(v: unknown): v is TaskPriority {
  return v === "low" || v === "medium" || v === "high";
}
