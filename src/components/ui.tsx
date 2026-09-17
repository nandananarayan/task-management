"use client";

// Lunorsoft — shared UI primitives (design system).
// Keep styling consistent: warm surfaces, soft radius, café accent.

import { AlertTriangle, Coffee, Loader2 } from "lucide-react";
import { useEffect, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cx } from "@/lib/utils";

/* ---------- Button ---------- */
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "soft";
type ButtonSize = "sm" | "md" | "lg";

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize; loading?: boolean }) {
  return (
    <button
      className={cx(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
        size === "sm" && "h-9 px-3.5 text-[13px]",
        size === "md" && "h-11 px-5 text-sm",
        size === "lg" && "h-12 px-6 text-[15px]",
        variant === "primary" &&
          "bg-[var(--accent)] text-[var(--accent-ink)] shadow-[0_8px_20px_-8px_rgba(120,75,30,0.6)] hover:brightness-105 hover:shadow-[0_10px_24px_-8px_rgba(120,75,30,0.7)] dark:shadow-[0_8px_20px_-8px_rgba(224,164,88,0.5)]",
        variant === "secondary" &&
          "border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-2)]",
        variant === "soft" &&
          "bg-[var(--surface-2)] text-[var(--ink)] hover:brightness-[0.98] border border-transparent",
        variant === "ghost" && "text-[var(--ink-soft)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]",
        variant === "danger" &&
          "bg-[#b3402e] text-white shadow-[0_8px_20px_-8px_rgba(179,64,46,0.7)] hover:brightness-105",
        className
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

/* ---------- Fields ---------- */
export function Field({
  label,
  error,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-[13px] font-semibold text-[var(--ink-soft)]">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-[13px] font-medium text-[#b3402e] dark:text-[#e88a76]">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[13px] text-[var(--muted)]">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({
  className,
  invalid,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      className={cx(
        "input-cafe h-11 w-full rounded-xl px-4 text-[15px]",
        invalid && "border-[#b3402e]! dark:border-[#e88a76]!",
        className
      )}
      {...rest}
    />
  );
}

export function Textarea({
  className,
  invalid,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      className={cx(
        "input-cafe min-h-[88px] w-full resize-y rounded-xl px-4 py-3 text-[15px] leading-relaxed",
        invalid && "border-[#b3402e]! dark:border-[#e88a76]!",
        className
      )}
      {...rest}
    />
  );
}

export function Select({
  className,
  invalid,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select
      className={cx(
        "input-cafe h-11 w-full cursor-pointer rounded-xl px-4 text-[15px]",
        invalid && "border-[#b3402e]! dark:border-[#e88a76]!",
        className
      )}
      {...rest}
    >
      {children}
    </select>
  );
}

/* ---------- Badge ---------- */
export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "low" | "medium" | "high" | "success" | "warning"; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-[0.08em] uppercase",
        tone === "neutral" && "bg-[var(--surface-2)] text-[var(--ink-soft)]",
        tone === "low" && "bg-[#e9efe3] text-[#49543b] dark:bg-[#2a3324] dark:text-[#b9c9a6]",
        tone === "medium" && "bg-[#f6e8c8] text-[#7d5a1e] dark:bg-[#3a2f1a] dark:text-[#e3b878]",
        tone === "high" && "bg-[#f6d9d0] text-[#8f3423] dark:bg-[#3d231c] dark:text-[#e88a76]",
        tone === "success" && "bg-[#dcead6] text-[#3c5a34] dark:bg-[#243024] dark:text-[#9dc08f]",
        tone === "warning" && "bg-[#f6e8c8] text-[#7d5a1e] dark:bg-[#3a2f1a] dark:text-[#e3b878]",
        className
      )}
    >
      {children}
    </span>
  );
}

/* ---------- Card ---------- */
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("card-surface rounded-2xl shadow-[var(--shadow-cafe)] dark:shadow-[var(--shadow-night)]", className)}>
      {children}
    </div>
  );
}

/* ---------- Modal ---------- */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
      <div
        className={cx(
          "relative w-full card-surface rounded-t-3xl sm:rounded-3xl shadow-[var(--shadow-cafe-lg)] animate-pop max-h-[92vh] overflow-y-auto scrollbar-thin",
          wide ? "sm:max-w-2xl" : "sm:max-w-lg"
        )}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[var(--line)] bg-[var(--surface)] px-6 py-5">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-[var(--muted)]">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
          >
            <span aria-hidden className="text-xl leading-none">×</span>
          </button>
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  );
}

/* ---------- States ---------- */
export function LoadingState({ label = "Loading…", rows = 3 }: { label?: string; rows?: number }) {
  return (
    <div role="status" aria-label={label} className="space-y-3">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card-surface rounded-2xl p-5">
          <div className="skeleton h-4 w-24 rounded-full" />
          <div className="skeleton mt-3 h-5 w-3/4 rounded-lg" />
          <div className="skeleton mt-2 h-4 w-1/2 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  message,
  action,
  icon,
}: {
  title: string;
  message: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="card-surface flex flex-col items-center rounded-3xl px-8 py-14 text-center animate-fade-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--accent)]">
        {icon ?? <Coffee className="h-7 w-7" aria-hidden />}
      </div>
      <h3 className="font-display mt-5 text-xl font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--muted)]">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="card-surface flex flex-col items-center rounded-3xl px-8 py-14 text-center animate-fade-in" role="alert">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f6d9d0] text-[#8f3423] dark:bg-[#3d231c] dark:text-[#e88a76]">
        <AlertTriangle className="h-7 w-7" aria-hidden />
      </div>
      <h3 className="font-display mt-5 text-xl font-semibold">Something went wrong</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--muted)]">{message}</p>
      {onRetry && (
        <div className="mt-6">
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}

export function InlineError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl border border-[#b3402e]/25 bg-[#b3402e]/8 px-4 py-3 text-sm font-medium text-[#8f3423] dark:border-[#e88a76]/25 dark:bg-[#e88a76]/10 dark:text-[#e88a76]">
      {message}
    </p>
  );
}
