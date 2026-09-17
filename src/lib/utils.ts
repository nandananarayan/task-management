// Small shared helpers (classnames, dates, formatting).

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function formatDateLong(d: Date = new Date()): string {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isOverdue(dueDate: string | null | undefined, completed: boolean): boolean {
  if (!dueDate || completed) return false;
  const due = new Date(dueDate);
  const now = new Date();
  // Overdue if due day is before today.
  const endOfDue = new Date(due);
  endOfDue.setHours(23, 59, 59, 999);
  return endOfDue.getTime() < now.getTime();
}

export function formatDueLabel(dueDate: string | null | undefined): string | null {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const time = due.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const hasTime = due.getHours() !== 0 || due.getMinutes() !== 0;
  if (isSameDay(due, now)) return hasTime ? `Today · ${time}` : "Today";
  if (isSameDay(due, tomorrow)) return hasTime ? `Tomorrow · ${time}` : "Tomorrow";
  const date = due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return hasTime ? `${date} · ${time}` : date;
}

/** Convert datetime-local value -> ISO string (or null). */
export function datetimeLocalToISO(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

/** Convert ISO string -> datetime-local input value. */
export function isoToDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
