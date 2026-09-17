"use client";

// Lunorsoft — "Sugar Riddles": a tiny curated riddle deck.

import { useMemo, useState } from "react";
import { ArrowRight, Check, Eye, Lightbulb, X } from "lucide-react";
import { Button, Field, Input } from "@/components/ui";
import { cx } from "@/lib/utils";

interface Riddle {
  question: string;
  answers: string[];
  hint: string;
}

const RIDDLES: Riddle[] = [
  {
    question: "I have keys but no locks. I have space but no room. You can enter but never leave. What am I?",
    answers: ["keyboard", "a keyboard", "computer keyboard"],
    hint: "You tap me every day.",
  },
  {
    question: "The more of me you take, the more you leave behind. What am I?",
    answers: ["steps", "footsteps", "step", "footstep"],
    hint: "Think about walking.",
  },
  {
    question: "I have pages but I'm not a book. I have a spine but no bones. Students fear my due date. What am I?",
    answers: ["notebook", "a notebook", "journal", "assignment", "textbook"],
    hint: "You write in me.",
  },
  {
    question: "What has a head and a tail but no body?",
    answers: ["coin", "a coin"],
    hint: "Check your pocket.",
  },
  {
    question: "I get wetter the more I dry. What am I?",
    answers: ["towel", "a towel"],
    hint: "Found in bathrooms.",
  },
  {
    question: "What runs but never walks, has a mouth but never talks, has a bed but never sleeps?",
    answers: ["river", "a river"],
    hint: "It flows to the sea.",
  },
  {
    question: "I have cities but no houses, forests but no trees, rivers but no water. What am I?",
    answers: ["map", "a map"],
    hint: "Fold me up.",
  },
  {
    question: "What can you catch but never throw?",
    answers: ["cold", "a cold", "flu", "chill"],
    hint: "Bless you.",
  },
];

function normalise(s: string): string {
  return s.trim().toLowerCase().replace(/^(a|an|the)\s+/, "").replace(/[^a-z ]/g, "");
}

export function RiddleGame() {
  const [order] = useState<number[]>(() => {
    const idx = RIDDLES.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    return idx;
  });
  const [pos, setPos] = useState(0);
  const [guess, setGuess] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [verdict, setVerdict] = useState<"correct" | "wrong" | null>(null);
  const [solved, setSolved] = useState(0);
  const [attempted, setAttempted] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const riddle = useMemo(() => RIDDLES[order[pos % order.length]], [order, pos]);
  const done = pos >= RIDDLES.length;

  function check() {
    if (!guess.trim() || verdict === "correct") return;
    const ok = riddle.answers.some((a) => normalise(a) === normalise(guess));
    if (ok) {
      setVerdict("correct");
      setSolved((s) => s + 1);
      setAttempted((a) => a + 1);
    } else {
      setVerdict("wrong");
      setAttempted((a) => a + 1);
    }
  }

  function next() {
    setPos((p) => p + 1);
    setGuess("");
    setRevealed(false);
    setVerdict(null);
    setShowHint(false);
  }

  function restart() {
    setPos(0);
    setGuess("");
    setRevealed(false);
    setVerdict(null);
    setSolved(0);
    setAttempted(0);
    setShowHint(false);
  }

  if (done) {
    return (
      <div className="mx-auto w-full max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e9efe3] text-[#49543b] dark:bg-[#2a3324] dark:text-[#b9c9a6]">
          <Lightbulb className="h-7 w-7" aria-hidden />
        </div>
        <h3 className="font-display mt-4 text-2xl font-bold">Deck complete</h3>
        <p className="mt-2 text-sm text-[var(--muted)]">
          You solved <strong className="text-[var(--ink)]">{solved}</strong> of {RIDDLES.length} riddles
          {attempted > 0 ? ` in ${attempted} ${attempted === 1 ? "guess" : "guesses"}` : ""}.
        </p>
        <div className="mt-6">
          <Button onClick={restart}>Shuffle & replay</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl font-bold tracking-tight">Sugar Riddles</h3>
          <p className="text-[13px] text-[var(--muted)]">
            Riddle {Math.min(pos + 1, RIDDLES.length)} of {RIDDLES.length} · {solved} solved
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={restart}>
          Restart
        </Button>
      </div>

      {/* progress dots */}
      <div className="mt-4 flex gap-1.5" aria-hidden>
        {RIDDLES.map((_, i) => (
          <span
            key={i}
            className={cx(
              "h-1.5 flex-1 rounded-full",
              i < pos ? "bg-[var(--accent)]" : i === pos ? "bg-[var(--accent)]/50" : "bg-[var(--surface-2)]"
            )}
          />
        ))}
      </div>

      <blockquote className="font-display mt-5 rounded-2xl bg-[var(--surface-2)] px-6 py-6 text-center text-[17px] leading-relaxed font-medium text-[var(--ink)]">
        “{riddle.question}”
      </blockquote>

      <div className="mt-5">
        <Field label="Your answer" htmlFor="riddle-answer">
          <div className="flex gap-2">
            <Input
              id="riddle-answer"
              value={guess}
              onChange={(e) => {
                setGuess(e.target.value);
                setVerdict(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  check();
                }
              }}
              placeholder="Type your answer…"
              disabled={verdict === "correct"}
              invalid={verdict === "wrong"}
            />
            <Button onClick={check} disabled={!guess.trim() || verdict === "correct"}>
              Check
            </Button>
          </div>
        </Field>

        <div aria-live="polite" className="mt-3 min-h-6">
          {verdict === "correct" && (
            <p className="inline-flex items-center gap-1.5 rounded-full bg-[#dcead6] px-3 py-1.5 text-[13px] font-bold text-[#3c5a34] dark:bg-[#243024] dark:text-[#9dc08f]">
              <Check className="h-4 w-4" aria-hidden /> Sweet — that&apos;s right.
            </p>
          )}
          {verdict === "wrong" && !revealed && (
            <p className="inline-flex items-center gap-1.5 rounded-full bg-[#f6d9d0] px-3 py-1.5 text-[13px] font-bold text-[#8f3423] dark:bg-[#3d231c] dark:text-[#e88a76]">
              <X className="h-4 w-4" aria-hidden /> Not quite — try again.
            </p>
          )}
        </div>

        {revealed && (
          <p className="mt-2 rounded-xl border border-dashed border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm animate-fade-in">
            Answer: <strong className="font-display text-[15px]">{riddle.answers[0]}</strong>
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {verdict === "correct" ? (
            <Button onClick={next}>
              Next riddle <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={() => setShowHint((s) => !s)}>
                <Lightbulb className="h-3.5 w-3.5" aria-hidden /> {showHint ? "Hide hint" : "Hint"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setRevealed(true)}>
                <Eye className="h-3.5 w-3.5" aria-hidden /> Reveal
              </Button>
              {revealed && (
                <Button size="sm" onClick={next}>
                  Next <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Button>
              )}
            </>
          )}
        </div>
        {showHint && (
          <p className="mt-3 text-sm text-[var(--muted)] italic animate-fade-in">Hint: {riddle.hint}</p>
        )}
      </div>
    </div>
  );
}
