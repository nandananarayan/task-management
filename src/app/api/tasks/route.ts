import { and, desc, eq, ilike } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { getSessionUser } from "@/lib/auth-server";
import type { Task } from "@/types/task";
import { isTaskPriority } from "@/types/task";

export const dynamic = "force-dynamic";

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

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ message: "Not authenticated." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter");
  const search = searchParams.get("search")?.trim();

  const conditions = [eq(tasks.userId, user.id)];
  if (filter === "pending") conditions.push(eq(tasks.completed, false));
  if (filter === "completed") conditions.push(eq(tasks.completed, true));
  if (search) conditions.push(ilike(tasks.title, `%${search}%`));

  const rows = await db
    .select()
    .from(tasks)
    .where(and(...conditions))
    .orderBy(desc(tasks.createdAt))
    .limit(500);

  return NextResponse.json({ tasks: rows.map(toTask) });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ message: "Not authenticated." }, { status: 401 });

  let body: { title?: string; description?: string | null; priority?: unknown; dueDate?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const title = (body.title ?? "").trim();
  const description = body.description?.trim() ? body.description.trim().slice(0, 2000) : null;
  const priority = isTaskPriority(body.priority) ? body.priority : null;

  const fields: Record<string, string> = {};
  if (!title) fields.title = "Please give your task a title.";
  if (title.length > 140) fields.title = "Title must be 140 characters or fewer.";
  if (!priority) fields.priority = "Please choose a priority.";
  let due: Date | null = null;
  if (body.dueDate) {
    due = new Date(body.dueDate);
    if (Number.isNaN(due.getTime())) fields.dueDate = "Please choose a valid date.";
  }
  if (Object.keys(fields).length > 0) {
    return NextResponse.json({ message: "Please fix the highlighted fields.", fields }, { status: 422 });
  }

  const inserted = await db
    .insert(tasks)
    .values({ userId: user.id, title: title.slice(0, 140), description, priority: priority!, dueDate: due })
    .returning();

  return NextResponse.json({ task: toTask(inserted[0]) }, { status: 201 });
}
