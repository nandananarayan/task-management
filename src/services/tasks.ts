// Lunorsoft — Task service abstraction.
//
// UI components MUST call these functions instead of scattering fetch() calls.
// They map 1:1 to the backend contract:
//
//   GET    /api/tasks
//   POST   /api/tasks
//   GET    /api/tasks/:id
//   PATCH  /api/tasks/:id
//   DELETE /api/tasks/:id
//
// NOTE (backend-readiness): this module is the ONLY place that knows the
// REST paths. To swap implementations (e.g. mock -> real API), replace the
// bodies here — no component needs to change. The current implementation
// talks to the real Next.js + PostgreSQL API included in this repo.

import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api-client";
import type {
  CreateTaskInput,
  Task,
  TaskQuery,
  UpdateTaskInput,
} from "@/types/task";

interface TaskListResponse {
  tasks: Task[];
}
interface TaskResponse {
  task: Task;
}

export async function getTasks(query: TaskQuery = {}): Promise<Task[]> {
  const params = new URLSearchParams();
  if (query.filter && query.filter !== "all") params.set("filter", query.filter);
  if (query.search) params.set("search", query.search);
  const qs = params.toString();
  const res = await apiGet<TaskListResponse>(`/api/tasks${qs ? `?${qs}` : ""}`);
  return res.tasks;
}

export async function getTask(id: string): Promise<Task> {
  const res = await apiGet<TaskResponse>(`/api/tasks/${id}`);
  return res.task;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const res = await apiPost<TaskResponse>("/api/tasks", {
    title: input.title.trim(),
    description: input.description?.trim() || null,
    priority: input.priority,
    dueDate: input.dueDate ?? null,
  });
  return res.task;
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  const res = await apiPatch<TaskResponse>(`/api/tasks/${id}`, input);
  return res.task;
}

export async function deleteTask(id: string): Promise<void> {
  await apiDelete(`/api/tasks/${id}`);
}

export async function toggleTaskCompletion(task: Task): Promise<Task> {
  return updateTask(task.id, { completed: !task.completed });
}
