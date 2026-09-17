// Lunorsoft — public landing. Redirects authenticated students to /today.

import { ArrowRight, CheckCircle2, Coffee, Gamepad2, MoonStar, Sun } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-server";
import { ThemeToggle } from "@/components/theme";

export default async function LandingPage() {
  const user = await getSessionUser();
  if (user) redirect("/today");

  return (
    <div className="relative min-h-screen">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--accent-ink)] shadow-md">
            <Coffee className="h-5 w-5" aria-hidden strokeWidth={2.2} />
          </span>
          <span className="leading-tight">
            <span className="font-display block text-[17px] font-bold tracking-tight">Lunorsoft</span>
            <span className="block text-[11px] font-semibold tracking-[0.22em] text-[var(--muted)] uppercase">
              Study Café
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle compact />
          <Link
            href="/login"
            className="hidden h-10 items-center rounded-full px-4 text-sm font-semibold text-[var(--ink-soft)] transition hover:bg-[var(--surface-2)] sm:inline-flex"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--accent-ink)] shadow-md transition hover:brightness-105"
          >
            Take a seat <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        {/* Hero */}
        <section className="grid items-center gap-10 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 py-1.5 text-xs font-bold tracking-[0.14em] text-[var(--accent)] uppercase shadow-[var(--shadow-cafe)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
              </span>
              Now seating students
            </p>
            <h1 className="font-display mt-5 text-5xl leading-[1.02] font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
              Your calm corner for getting things{" "}
              <span className="relative inline-block text-[var(--accent)]">
                done.
                <svg viewBox="0 0 220 14" aria-hidden className="absolute -bottom-1 left-0 w-full text-[var(--accent)]/40">
                  <path d="M3 10 C 60 3, 160 3, 217 8" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--ink-soft)]">
              Lunorsoft is a study café for your academic life — pin tasks to your table like
              order tickets, work through them one by one, then take a gentle five-minute break.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-7 text-[15px] font-bold text-[var(--accent-ink)] shadow-[0_12px_28px_-10px_rgba(120,75,30,0.7)] transition hover:brightness-105 active:scale-[0.98]"
              >
                Create free account <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-13 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-7 text-[15px] font-bold transition hover:bg-[var(--surface-2)]"
              >
                Log in
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--muted)]">
              <span className="inline-flex items-center gap-1.5">
                <Sun className="h-4 w-4" aria-hidden /> Warm day mode
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MoonStar className="h-4 w-4" aria-hidden /> Cozy night mode
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Gamepad2 className="h-4 w-4" aria-hidden /> 5-minute breaks
              </span>
            </div>
          </div>

          {/* Hero ticket preview */}
          <div className="relative animate-fade-up" style={{ animationDelay: "120ms" }}>
            <div className="card-surface rotate-1 rounded-3xl p-6 shadow-[var(--shadow-cafe-lg)] transition-transform duration-500 hover:rotate-0">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f6d9d0] px-2.5 py-1 text-[11px] font-bold tracking-[0.08em] text-[#8f3423] uppercase dark:bg-[#3d231c] dark:text-[#e88a76]">
                  <span className="h-1.5 w-1.5 rounded-full bg-current" /> High
                </span>
                <span className="font-display text-[11px] tracking-[0.2em] text-[var(--muted)] uppercase">№ 0241</span>
              </div>
              <h3 className="font-display mt-3 text-2xl font-semibold tracking-tight">Finish DBMS assignment</h3>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">Database normalization notes · chapters 4–6</p>
              <p className="mt-3 text-[13px] font-medium text-[var(--muted)]">Today · 6:00 PM</p>
              <div className="mt-4 flex gap-2 border-t border-dashed border-[var(--line)] pt-4">
                <span className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#3c5a34] px-3.5 text-[13px] font-semibold text-white dark:bg-[#9dc08f] dark:text-[#1a2416]">
                  <CheckCircle2 className="h-4 w-4" aria-hidden /> Complete
                </span>
                <span className="inline-flex h-9 items-center rounded-lg bg-[var(--surface-2)] px-3 text-[13px] font-semibold text-[var(--ink-soft)]">Edit</span>
              </div>
              {/* steam */}
              <div aria-hidden className="absolute -top-3 right-10 flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="block h-6 w-[3px] rounded-full bg-[var(--accent)]/30 animate-steam" style={{ animationDelay: `${i * 0.5}s` }} />
                ))}
              </div>
            </div>
            <div className="card-surface absolute -bottom-6 -left-4 -rotate-2 rounded-2xl px-5 py-4 shadow-[var(--shadow-cafe-lg)] sm:-left-8">
              <p className="text-[11px] font-bold tracking-[0.18em] text-[var(--muted)] uppercase">Today&apos;s progress</p>
              <div className="mt-2 h-2.5 w-44 overflow-hidden rounded-full bg-[var(--surface-2)]">
                <div className="h-full w-3/5 rounded-full bg-[var(--accent)]" />
              </div>
              <p className="mt-1.5 text-[13px] font-semibold">3 of 5 tickets served</p>
            </div>
          </div>
        </section>

        {/* Pillars */}
        <section className="grid gap-4 pb-20 sm:grid-cols-3">
          {[
            { icon: Coffee, title: "One calm table", text: "Today, upcoming and completed tickets — always organised, never cluttered." },
            { icon: CheckCircle2, title: "Satisfying finishes", text: "Stamp tasks complete with optimistic, rollback-safe updates." },
            { icon: Gamepad2, title: "Breaks, not distractions", text: "Three tiny games inside a gentle 5-minute timer that nudges you back." },
          ].map((f, i) => (
            <div key={f.title} className="card-surface rounded-3xl p-6 shadow-[var(--shadow-cafe)] animate-fade-up" style={{ animationDelay: `${200 + i * 80}ms` }}>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)]/12 text-[var(--accent)]">
                <f.icon className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="font-display mt-4 text-lg font-bold">{f.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">{f.text}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-[var(--line)] py-6 text-center text-[13px] text-[var(--muted)]">
        Lunorsoft Study Café — brewed for focused students.
      </footer>
    </div>
  );
}
