"use client";

// Lunorsoft — Study Break: 5-minute timer + exactly three tiny games.

import { useState } from "react";
import { BookOpenText, Keyboard, Zap } from "lucide-react";
import { Card } from "@/components/ui";
import { BreakTimer } from "@/features/break/BreakTimer";
import { ReflexGame } from "@/features/break/ReflexGame";
import { RiddleGame } from "@/features/break/RiddleGame";
import { WordGame } from "@/features/break/WordGame";
import { cx } from "@/lib/utils";

type GameId = "words" | "riddles" | "reflex";

const GAMES: Array<{ id: GameId; label: string; hint: string; icon: React.ElementType }> = [
  { id: "words", label: "Brew Words", hint: "5-letter guessing", icon: Keyboard },
  { id: "riddles", label: "Sugar Riddles", hint: "tiny brain teasers", icon: BookOpenText },
  { id: "reflex", label: "Firefly Catch", hint: "quick reflexes", icon: Zap },
];

export default function BreakPage() {
  const [game, setGame] = useState<GameId>("words");

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="text-[11px] font-bold tracking-[0.22em] text-[var(--accent)] uppercase">Study break</p>
        <h1 className="font-display mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Take five.</h1>
        <p className="mt-1 max-w-xl text-[15px] leading-relaxed text-[var(--ink-soft)]">
          Work, then a controlled short break, then back to work. Pick one game while the timer runs.
        </p>
      </div>

      <BreakTimer />

      <Card className="p-6 sm:p-8">
        <div role="tablist" aria-label="Choose a break game" className="grid gap-2 sm:grid-cols-3">
          {GAMES.map((g) => {
            const active = game === g.id;
            return (
              <button
                key={g.id}
                role="tab"
                aria-selected={active}
                onClick={() => setGame(g.id)}
                className={cx(
                  "flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-left transition-all",
                  active
                    ? "border-[var(--accent)] bg-[var(--accent)]/8 shadow-sm"
                    : "border-[var(--line)] hover:bg-[var(--surface-2)]"
                )}
              >
                <span
                  className={cx(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                    active ? "bg-[var(--accent)] text-[var(--accent-ink)]" : "bg-[var(--surface-2)] text-[var(--ink-soft)]"
                  )}
                >
                  <g.icon className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block text-[15px] font-bold">{g.label}</span>
                  <span className="block text-xs text-[var(--muted)]">{g.hint}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 border-t border-dashed border-[var(--line)] pt-8" role="tabpanel" key={game}>
          {game === "words" && <WordGame />}
          {game === "riddles" && <RiddleGame />}
          {game === "reflex" && <ReflexGame />}
        </div>
      </Card>
    </div>
  );
}
