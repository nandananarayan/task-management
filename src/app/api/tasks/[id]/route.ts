import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { getSessionUser } from "@/lib/auth-server";
import type { Task } from "@/types/task";
import { isTaskPriority } from "@/types/task";

function toTask(row: typeof tasks.$inferSelect): Task {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    description: row.description,
    priority: row.priority,
    dueDate: row.dueDate ? row.dueDate.toISOString() : null,
    completed: row.completed,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  const { id } = await ctx.params;
  const rows = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)))
    .limit(1);
  if (rows.length === 0) return NextResponse.json({ message: "Task not found." }, { status: 404 });
  return NextResponse.json({ task: toTask(rows[0]) });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  const { id } = await ctx.params;

  let body: {
    title?: string;
    description?: string | null;
    priority?: unknown;
    dueDate?: string | null;
    completed?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const patch: Partial<typeof tasks.$inferInsert> = { updatedAt: new Date() };
  const fields: Record<string, string> = {};

  if (body.title !== undefined) {
    const title = body.title.trim();
    if (!title) fields.title = "Title cannot be empty.";
    else if (title.length > 140) fields.title = "Title must be 140 characters or fewer.";
    else patch.title = title;
  }
  if (body.description !== undefined) {
    patch.description = body.description?.trim() ? body.description.trim().slice(0, 2000) : null;
  }
  if (body.priority !== undefined) {
    if (!isTaskPriority(body.priority)) fields.priority = "Please choose a valid priority.";
    else patch.priority = body.priority;
  }
  if (body.dueDate !== undefined) {
    if (body.dueDate === null || body.dueDate === "") patch.dueDate = null;
    else {
      const d = new Date(body.dueDate);
      if (Number.isNaN(d.getTime())) fields.dueDate = "Please choose a valid date.";
      else patch.dueDate = d;
    }
  }
  if (body.completed !== undefined) patch.completed = Boolean(body.completed);

  if (Object.keys(fields).length > 0) {
    return NextResponse.json({ message: "Please fix the highlighted fields.", fields }, { status: 422 });
  }

  const updated = await db
    .update(tasks)
    .set(patch)
    .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)))
    .returning();

  if (updated.length === 0) return NextResponse.json({ message: "Task not found." }, { status: 404 });
  return NextResponse.json({ task: toTask(updated[0]) });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  const { id } = await ctx.params;
  const deleted = await db
    .delete(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)))
    .returning({ id: tasks.id });
  if (deleted.length === 0) return NextResponse.json({ message: "Task not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
