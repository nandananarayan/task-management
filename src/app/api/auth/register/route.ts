import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  createSession,
  hashPassword,
  isValidEmail,
  toPublicUser,
} from "@/lib/auth-server";

export async function POST(req: Request) {
  let body: { name?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  const fields: Record<string, string> = {};
  if (!name || name.length < 2) fields.name = "Please enter your name (2+ characters).";
  if (name.length > 80) fields.name = "Name must be 80 characters or fewer.";
  if (!isValidEmail(email)) fields.email = "Please enter a valid email address.";
  if (password.length < 8) fields.password = "Password must be at least 8 characters.";
  if (password.length > 128) fields.password = "Password must be 128 characters or fewer.";
  if (Object.keys(fields).length > 0) {
    return NextResponse.json({ message: "Please fix the highlighted fields.", fields }, { status: 422 });
  }

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return NextResponse.json(
      { message: "An account with this email already exists.", fields: { email: "This email is already registered." } },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const inserted = await db
    .insert(users)
    .values({ name, email, passwordHash })
    .returning();
  const user = inserted[0];
  await createSession(user.id);

  return NextResponse.json({ user: toPublicUser(user) }, { status: 201 });
}
