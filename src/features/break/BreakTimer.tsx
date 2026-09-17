"use client";

// Lunorsoft — 5-minute Study Break timer.
// A gentle productivity nudge, never a hard block.

import { Coffee, Pause, Play, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button, Card } from "@/components/ui";
import { cx } from "@/lib/utils";

const TOTAL_SECONDS = 5 * 60;

function format(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function BreakTimer({ onStateChange }: { onStateChange?: (running: boolean) => void }) {
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [running, setRunning] = useState(false);
  const done = secondsLeft <= 0;
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running || done) return;
    interval.current = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, [running, done]);

  useEffect(() => {
    onStateChange?.(running && !done);
  }, [running, done, onStateChange]);

  useEffect(() => {
    if (done) setRunning(false);
  }, [done]);

  const progress = 1 - secondsLeft / TOTAL_SECONDS;
  const R = 84;
  const C = 2 * Math.PI * R;

  function reset() {
    setSecondsLeft(TOTAL_SECONDS);
    setRunning(false);
  }

  if (done) {
    return (
      <Card className="overflow-hidden p-8 text-center animate-pop">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f6e8c8] text-[#7d5a1e] dark:bg-[#3a2f1a] dark:text-[#e3b878]">
          <Coffee className="h-7 w-7" aria-hidden />
        </div>
        <h2 className="font-display mt-4 text-2xl font-bold tracking-tight">Break&apos;s over.</h2>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-[var(--muted)]">
          Back to the table — you&apos;ve got this. Your tickets are waiting.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Link href="/tasks">
            <Button size="lg">Return to tasks</Button>
          </Link>
          <Button size="lg" variant="secondary" onClick={reset}>
            <RotateCcw className="h-4 w-4" aria-hidden /> Restart break
          </Button>
        </div>
        <p className="mt-4 text-xs text-[var(--muted)]">
          The timer never locks you out — it&apos;s just a gentle nudge.
        </p>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden p-6 sm:p-8">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
        {/* Ring */}
        <div className="relative h-48 w-48 shrink-0" role="timer" aria-label={`${format(secondsLeft)} remaining`} aria-live="off">
          <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
            <circle cx="100" cy="100" r={R} fill="none" stroke="var(--surface-2)" strokeWidth="14" />
            <circle
              cx="100"
              cy="100"
              r={R}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - progress)}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-4xl font-bold tracking-tight tabular-nums">{format(secondsLeft)}</span>
            <span className="mt-1 text-[11px] font-bold tracking-[0.2em] text-[var(--muted)] uppercase">
              {running ? "On break" : "Paused"}
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="text-[11px] font-bold tracking-[0.22em] text-[var(--accent)] uppercase">Study break</p>
          <h2 className="font-display mt-1 text-2xl font-bold tracking-tight sm:text-3xl">You have 5 minutes.</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            Pick one tiny game, stretch, sip something warm — then return to your table refreshed.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
            <Button onClick={() => setRunning((r) => !r)} className={cx(!running && secondsLeft === TOTAL_SECONDS && "px-7")}>
              {running ? (
                <>
                  <Pause className="h-4 w-4" aria-hidden /> Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" aria-hidden /> {secondsLeft === TOTAL_SECONDS ? "Start break" : "Resume"}
                </>
              )}
            </Button>
            {secondsLeft !== TOTAL_SECONDS && (
              <Button variant="secondary" onClick={reset}>
                <RotateCcw className="h-4 w-4" aria-hidden /> Reset
              </Button>
            )}
            <Link href="/tasks">
              <Button variant="ghost">Exit break</Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
