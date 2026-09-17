"use client";

// Lunorsoft — Login. Thin UI over services/auth.ts login().

import { Coffee, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ThemeToggle } from "@/components/theme";
import { Button, Field, InlineError, Input } from "@/components/ui";
import { useAuth } from "@/features/auth/AuthProvider";
import { ApiError } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/today");
  }, [loading, user, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Please enter a valid email address.";
    if (!password) next.password = "Please enter your password.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    setServerError(null);
    try {
      await login({ email: email.trim(), password });
      router.push("/today");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && err.fields) setErrors(err.fields);
      setServerError(err instanceof ApiError ? err.message : "Could not log in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Back to home">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--accent-ink)] shadow-md">
            <Coffee className="h-5 w-5" aria-hidden strokeWidth={2.2} />
          </span>
          <span className="leading-tight">
            <span className="font-display block text-[17px] font-bold tracking-tight">Lunorsoft</span>
            <span className="block text-[11px] font-semibold tracking-[0.22em] text-[var(--muted)] uppercase">Study Café</span>
          </span>
        </Link>
        <ThemeToggle compact />
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-4 pb-16 sm:px-6">
        <div className="grid w-full items-center gap-10 lg:grid-cols-2">
          <div className="hidden lg:block animate-fade-up">
            <p className="text-[11px] font-bold tracking-[0.22em] text-[var(--accent)] uppercase">Welcome back</p>
            <h1 className="font-display mt-3 text-5xl leading-[1.05] font-bold tracking-tight text-balance">
              Your table kept your seat warm.
            </h1>
            <p className="mt-4 max-w-md text-[17px] leading-relaxed text-[var(--ink-soft)]">
              Log in to see today&apos;s tickets, your progress, and everything waiting on your café table.
            </p>
            <div className="card-surface mt-8 max-w-md rounded-3xl p-5 shadow-[var(--shadow-cafe)]">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/12 font-display text-lg font-bold text-[var(--accent)]">“</span>
                <p className="text-sm leading-relaxed text-[var(--ink-soft)] italic">
                  One ticket at a time. Small steps, warm drinks, steady progress.
                </p>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md animate-fade-up" style={{ animationDelay: "100ms" }}>
            <div className="card-surface rounded-3xl p-7 shadow-[var(--shadow-cafe-lg)] sm:p-9">
              <h2 className="font-display text-3xl font-bold tracking-tight">Log in</h2>
              <p className="mt-1.5 text-sm text-[var(--muted)]">Good to see you again.</p>
              <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
                <InlineError message={serverError} />
                <Field label="Email" htmlFor="email" error={errors.email}>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    invalid={Boolean(errors.email)}
                  />
                </Field>
                <Field label="Password" htmlFor="password" error={errors.password}>
                  <div className="relative">
                    <Input
                      id="password"
                      type={show ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      invalid={Boolean(errors.password)}
                      className="pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShow((s) => !s)}
                      aria-label={show ? "Hide password" : "Show password"}
                      aria-pressed={show}
                      className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
                    >
                      {show ? <EyeOff className="h-4.5 w-4.5" aria-hidden /> : <Eye className="h-4.5 w-4.5" aria-hidden />}
                    </button>
                  </div>
                </Field>
                <Button type="submit" size="lg" loading={submitting} className="w-full">
                  Log in
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-[var(--muted)]">
                New to the café?{" "}
                <Link href="/signup" className="font-bold text-[var(--accent)] underline-offset-4 hover:underline">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
