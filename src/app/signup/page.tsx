"use client";

// Lunorsoft — Sign Up. Thin UI over services/auth.ts register().

import { Coffee, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ThemeToggle } from "@/components/theme";
import { Button, Field, InlineError, Input } from "@/components/ui";
import { useAuth } from "@/features/auth/AuthProvider";
import { ApiError } from "@/lib/api-client";

export default function SignupPage() {
  const router = useRouter();
  const { user, loading, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
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
    if (name.trim().length < 2) next.name = "Please enter your name (2+ characters).";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Please enter a valid email address.";
    if (password.length < 8) next.password = "Password must be at least 8 characters.";
    if (confirm !== password) next.confirmPassword = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    setServerError(null);
    try {
      await register({ name: name.trim(), email: email.trim(), password, confirmPassword: confirm });
      router.push("/today");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && err.fields) setErrors((p) => ({ ...p, ...err.fields }));
      setServerError(err instanceof ApiError ? err.message : "Could not create your account. Please try again.");
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
            <p className="text-[11px] font-bold tracking-[0.22em] text-[var(--accent)] uppercase">Join the café</p>
            <h1 className="font-display mt-3 text-5xl leading-[1.05] font-bold tracking-tight text-balance">
              Pull up a chair. Your semester, beautifully organised.
            </h1>
            <ul className="mt-6 space-y-3">
              {[
                "Pin study tickets with priorities & due dates",
                "Track today, pending and completed work",
                "Recharge with a gentle 5-minute break",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3 text-[15px] text-[var(--ink-soft)]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)]/15 text-[13px] font-bold text-[var(--accent)]">✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="mx-auto w-full max-w-md animate-fade-up" style={{ animationDelay: "100ms" }}>
            <div className="card-surface rounded-3xl p-7 shadow-[var(--shadow-cafe-lg)] sm:p-9">
              <h2 className="font-display text-3xl font-bold tracking-tight">Sign up</h2>
              <p className="mt-1.5 text-sm text-[var(--muted)]">Your own table, ready in seconds.</p>
              <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
                <InlineError message={serverError} />
                <Field label="Name" htmlFor="name" error={errors.name}>
                  <Input
                    id="name"
                    autoComplete="name"
                    placeholder="Amara Osei"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    invalid={Boolean(errors.name)}
                  />
                </Field>
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
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Password" htmlFor="password" error={errors.password}>
                    <div className="relative">
                      <Input
                        id="password"
                        type={show ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="8+ characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        invalid={Boolean(errors.password)}
                        className="pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShow((s) => !s)}
                        aria-label={show ? "Hide passwords" : "Show passwords"}
                        aria-pressed={show}
                        className="absolute top-1/2 right-1.5 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
                      >
                        {show ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                      </button>
                    </div>
                  </Field>
                  <Field label="Confirm" htmlFor="confirm" error={errors.confirmPassword}>
                    <Input
                      id="confirm"
                      type={show ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Repeat it"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      invalid={Boolean(errors.confirmPassword)}
                    />
                  </Field>
                </div>
                <Button type="submit" size="lg" loading={submitting} className="w-full">
                  Create account
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-[var(--muted)]">
                Already have a seat?{" "}
                <Link href="/login" className="font-bold text-[var(--accent)] underline-offset-4 hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
