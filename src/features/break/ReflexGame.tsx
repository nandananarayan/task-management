"use client";

// Lunorsoft — "Firefly Catch": a quick reflex game.
// Tap the glowing firefly 5 times as fast as you can.

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Zap } from "lucide-react";
import { Button } from "@/components/ui";
import { cx } from "@/lib/utils";

const ROUNDS = 5;

interface Dot {
  x: number; // percent
  y: number; // percent
  key: number;
}

function randomDot(key: number): Dot {
  return { x: 8 + Math.random() * 84, y: 12 + Math.random() * 72, key };
}

export function ReflexGame() {
  const [phase, setPhase] = useState<"idle" | "waiting" | "ready" | "done">("idle");
  const [round, setRound] = useState(0);
  const [dot, setDot] = useState<Dot | null>(null);
  const [times, setTimes] = useState<number[]>([]);
  const [early, setEarly] = useState(false);
  const shownAt = useRef(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }
  }, []);

  useEffect(() => clear, [clear]);

  const schedule = useCallback(
    (nextRound: number) => {
      setPhase("waiting");
      setDot(null);
      setEarly(false);
      clear();
      timeout.current = setTimeout(() => {
        setDot(randomDot(nextRound));
        shownAt.current = performance.now();
        setPhase("ready");
      }, 700 + Math.random() * 1600);
    },
    [clear]
  );

  function start() {
    setTimes([]);
    setRound(0);
    schedule(0);
  }

  function handleArenaClick() {
    if (phase === "waiting") {
      // Clicked too early — small penalty, reschedule same round.
      setEarly(true);
      clear();
      timeout.current = setTimeout(() => schedule(round), 900);
    }
  }

  function handleDotClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (phase !== "ready" || !dot) return;
    const ms = Math.round(performance.now() - shownAt.current);
    const next = [...times, ms];
    setTimes(next);
    if (next.length >= ROUNDS) {
      setPhase("done");
      setDot(null);
    } else {
      setRound(next.length);
      schedule(next.length);
    }
  }

  const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  const best = times.length ? Math.min(...times) : 0;

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl font-bold tracking-tight">Firefly Catch</h3>
          <p className="text-[13px] text-[var(--muted)]">Tap the firefly {ROUNDS} times, fast.</p>
        </div>
        {phase !== "idle" && (
          <Button variant="secondary" size="sm" onClick={start}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Restart
          </Button>
        )}
      </div>

      {/* score strip */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          { label: "Round", value: phase === "done" ? `${ROUNDS}/${ROUNDS}` : `${Math.min(times.length + 1, ROUNDS)}/${ROUNDS}` },
          { label: "Average", value: times.length ? `${avg}ms` : "—" },
          { label: "Best", value: times.length ? `${best}ms` : "—" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-[var(--surface-2)] px-2 py-2.5">
            <p className="text-[10px] font-bold tracking-[0.16em] text-[var(--muted)] uppercase">{s.label}</p>
            <p className="font-display text-lg font-bold tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      <div
        onClick={handleArenaClick}
        role="application"
        aria-label="Reflex game arena"
        className={cx(
          "relative mt-4 h-72 cursor-pointer overflow-hidden rounded-2xl border border-[var(--line)] transition-colors",
          phase === "waiting" && "bg-[var(--surface-2)]",
          phase === "ready" && "bg-[#1c2a1a] dark:bg-[#141f12]",
          (phase === "idle" || phase === "done") && "bg-[var(--surface-2)]"
        )}
      >
        {phase === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)]">
              <Zap className="h-6 w-6" aria-hidden />
            </span>
            <p className="max-w-60 text-sm text-[var(--muted)]">
              A firefly will appear at random. Catch it as quickly as you can.
            </p>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                start();
              }}
            >
              <Play className="h-4 w-4" aria-hidden /> Start
            </Button>
          </div>
        )}

        {phase === "waiting" && (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
            <p className={cx("text-sm font-semibold", early ? "text-[#b3402e] dark:text-[#e88a76]" : "text-[var(--muted)]")}>
              {early ? "Too soon! Wait for the firefly…" : "Wait for it…"}
            </p>
          </div>
        )}

        {phase === "ready" && dot && (
          <button
            key={dot.key}
            type="button"
            onClick={handleDotClick}
            aria-label="Catch the firefly"
            autoFocus
            className="absolute h-14 w-14 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full animate-pop"
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              background: "radial-gradient(circle at 38% 35%, #fff6dd, #f2c879 55%, #d99a3c)",
              boxShadow: "0 0 28px 8px rgba(242,200,121,0.65)",
            }}
          />
        )}

        {phase === "done" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center animate-fade-in">
            <p className="text-[11px] font-bold tracking-[0.2em] text-[var(--accent)] uppercase">Round complete</p>
            <p className="font-display text-3xl font-bold tabular-nums">{avg}ms</p>
            <p className="text-sm text-[var(--muted)]">
              Average reaction · best {best}ms
            </p>
            <div className="mt-2 flex gap-1.5">
              {times.map((t, i) => (
                <span key={i} className="rounded-lg bg-[var(--surface)] px-2 py-1 text-xs font-bold tabular-nums">
                  {t}
                </span>
              ))}
            </div>
            <Button
              size="sm"
              className="mt-3"
              onClick={(e) => {
                e.stopPropagation();
                start();
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Play again
            </Button>
          </div>
        )}
      </div>
      <p className="mt-3 text-center text-xs text-[var(--muted)]">
        Don&apos;t click early — patience is part of the game.
      </p>
    </div>
  );
}
