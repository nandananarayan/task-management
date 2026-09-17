"use client";

// Lunorsoft — "Brew Words": an original 5-letter word guessing game.
// Guess the hidden word in 6 tries. Keyboard + on-screen keys supported.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Delete, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui";
import { cx } from "@/lib/utils";

const WORDS = [
  "STUDY", "FOCUS", "NOTES", "LEARN", "ESSAY", "LATTE", "MOCHA", "BEANS",
  "QUIET", "DREAM", "LIGHT", "PAPER", "BRAVE", "CHARM", "CLOUD", "COAST",
  "FLAME", "GRAPE", "HEART", "IVORY", "MEDAL", "OCEAN", "PIANO", "QUILT",
  "ROAST", "STEAM", "TORCH", "UNITY", "VIVID", "WITTY",
].map((w) => w.toUpperCase());

const MAX_ROWS = 6;
const WORD_LEN = 5;

type Mark = "correct" | "present" | "absent";

function pickWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function markGuess(guess: string, answer: string): Mark[] {
  const result: Mark[] = Array(WORD_LEN).fill("absent");
  const remaining = new Map<string, number>();
  for (let i = 0; i < WORD_LEN; i++) {
    if (guess[i] === answer[i]) result[i] = "correct";
    else remaining.set(answer[i], (remaining.get(answer[i]) ?? 0) + 1);
  }
  for (let i = 0; i < WORD_LEN; i++) {
    if (result[i] === "correct") continue;
    const count = remaining.get(guess[i]) ?? 0;
    if (count > 0) {
      result[i] = "present";
      remaining.set(guess[i], count - 1);
    }
  }
  return result;
}

const KEYBOARD = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

export function WordGame() {
  const [answer, setAnswer] = useState(() => pickWord());
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [shakeRow, setShakeRow] = useState(false);
  const statusRef = useRef<HTMLParagraphElement>(null);

  const won = guesses.length > 0 && guesses[guesses.length - 1] === answer;
  const lost = !won && guesses.length >= MAX_ROWS;
  const over = won || lost;

  const marks = useMemo(() => guesses.map((g) => markGuess(g, answer)), [guesses, answer]);

  const keyState = useMemo(() => {
    const map = new Map<string, Mark>();
    const rank: Record<Mark, number> = { absent: 0, present: 1, correct: 2 };
    guesses.forEach((g, gi) => {
      g.split("").forEach((ch, i) => {
        const m = marks[gi][i];
        if ((rank[m] ?? 0) >= (rank[map.get(ch) ?? "absent"] ?? 0)) map.set(ch, m);
      });
    });
    return map;
  }, [guesses, marks]);

  function newGame() {
    setAnswer(pickWord());
    setGuesses([]);
    setCurrent("");
    setMessage(null);
  }

  const submit = useCallback(() => {
    if (over) return;
    if (current.length !== WORD_LEN) {
      setMessage("Enter a 5-letter word.");
      setShakeRow(true);
      setTimeout(() => setShakeRow(false), 400);
      return;
    }
    setGuesses((g) => [...g, current]);
    setCurrent("");
    setMessage(null);
  }, [current, over]);

  const press = useCallback(
    (key: string) => {
      if (over) return;
      if (key === "ENTER") return submit();
      if (key === "BACK") {
        setCurrent((c) => c.slice(0, -1));
        return;
      }
      if (/^[A-Z]$/.test(key) && current.length < WORD_LEN) {
        setCurrent((c) => c + key);
      }
    },
    [current, over, submit]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toUpperCase();
      if (k === "ENTER") submit();
      else if (k === "BACKSPACE") press("BACK");
      else if (/^[A-Z]$/.test(k)) press(k);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press, submit]);

  useEffect(() => {
    if (won) setMessage(`Brewed to perfection — “${answer}” in ${guesses.length} ${guesses.length === 1 ? "try" : "tries"}.`);
    else if (lost) setMessage(`Out of tries — the word was “${answer}”.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [won, lost]);

  const rows: Array<{ letters: string[]; marks: Mark[] | null; active: boolean }> = [];
  for (let r = 0; r < MAX_ROWS; r++) {
    if (r < guesses.length) {
      rows.push({ letters: guesses[r].split(""), marks: marks[r], active: false });
    } else if (r === guesses.length && !over) {
      const letters = current.padEnd(WORD_LEN, " ").split("");
      rows.push({ letters, marks: null, active: true });
    } else {
      rows.push({ letters: Array(WORD_LEN).fill(" "), marks: null, active: false });
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl font-bold tracking-tight">Brew Words</h3>
          <p className="text-[13px] text-[var(--muted)]">Guess the 5-letter blend in 6 tries.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={newGame}>
          <RotateCcw className="h-3.5 w-3.5" aria-hidden /> New
        </Button>
      </div>

      <div className="mt-5 grid gap-1.5" role="group" aria-label="Word grid">
        {rows.map((row, r) => (
          <div key={r} className={cx("grid grid-cols-5 gap-1.5", row.active && shakeRow && "animate-[pop_0.3s_ease]")}>
            {row.letters.map((ch, i) => {
              const m = row.marks?.[i] ?? null;
              return (
                <div
                  key={i}
                  className={cx(
                    "flex h-12 items-center justify-center rounded-xl border text-lg font-bold uppercase transition-all sm:h-13",
                    !m && ch.trim() && "border-[var(--accent)] bg-[var(--surface)]",
                    !m && !ch.trim() && "border-[var(--line)] bg-[var(--surface)]",
                    m === "correct" && "border-transparent bg-[#3c5a34] text-white dark:bg-[#9dc08f] dark:text-[#1a2416]",
                    m === "present" && "border-transparent bg-[#c98f2e] text-white dark:bg-[#e3b878] dark:text-[#2a1f0e]",
                    m === "absent" && "border-transparent bg-[var(--surface-2)] text-[var(--muted)]"
                  )}
                >
                  {ch}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <p ref={statusRef} role="status" aria-live="polite" className={cx("mt-4 min-h-5 text-center text-sm font-semibold", won ? "text-[#3c5a34] dark:text-[#9dc08f]" : "text-[var(--ink-soft)]")}>
        {message ?? (over ? "" : `${MAX_ROWS - guesses.length} tries left`)}
      </p>

      <div className="mt-3 space-y-1.5">
        {KEYBOARD.map((row) => (
          <div key={row} className="flex justify-center gap-1.5">
            {row === "ZXCVBNM" && (
              <button
                type="button"
                onClick={() => press("ENTER")}
                className="h-12 cursor-pointer rounded-lg bg-[var(--accent)] px-3 text-xs font-bold text-[var(--accent-ink)]"
              >
                ENTER
              </button>
            )}
            {row.split("").map((k) => {
              const s = keyState.get(k);
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => press(k)}
                  aria-label={`Letter ${k}`}
                  className={cx(
                    "h-12 min-w-7 flex-1 cursor-pointer rounded-lg text-sm font-bold transition active:scale-95 sm:min-w-8",
                    s === "correct" && "bg-[#3c5a34] text-white dark:bg-[#9dc08f] dark:text-[#1a2416]",
                    s === "present" && "bg-[#c98f2e] text-white dark:bg-[#e3b878] dark:text-[#2a1f0e]",
                    s === "absent" && "bg-[var(--surface-2)] text-[var(--muted)] opacity-60",
                    !s && "bg-[var(--surface-2)] text-[var(--ink)] hover:brightness-95"
                  )}
                >
                  {k}
                </button>
              );
            })}
            {row === "ZXCVBNM" && (
              <button
                type="button"
                onClick={() => press("BACK")}
                aria-label="Delete letter"
                className="flex h-12 cursor-pointer items-center rounded-lg bg-[var(--surface-2)] px-3 text-[var(--ink)]"
              >
                <Delete className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
