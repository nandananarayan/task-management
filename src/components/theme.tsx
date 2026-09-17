"use client";

// Lunorsoft — Day/Night theme. Persisted to localStorage ONLY for theme
// (task data always comes from the backend API — never localStorage).

import { Moon, Sun } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cx } from "@/lib/utils";

type Theme = "day" | "night";
const STORAGE_KEY = "lunorsoft-theme";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void; set: (t: Theme) => void }>({
  theme: "day",
  toggle: () => {},
  set: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function initialTheme(): Theme {
  if (typeof window === "undefined") return "day";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "day" || saved === "night") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "night" : "day";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("day");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(initialTheme());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "night");
    root.style.colorScheme = theme === "night" ? "dark" : "light";
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, mounted]);

  const toggle = useCallback(() => setTheme((t) => (t === "day" ? "night" : "day")), []);
  const set = useCallback((t: Theme) => setTheme(t), []);
  const value = useMemo(() => ({ theme, toggle, set }), [theme, toggle, set]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggle } = useTheme();
  const isNight = theme === "night";
  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={isNight}
      aria-label={isNight ? "Switch to day mode" : "Switch to night mode"}
      title={isNight ? "Switch to day mode" : "Switch to night mode"}
      className={cx(
        "group relative inline-flex items-center gap-2 rounded-full border p-1 transition-all duration-500",
        "border-[var(--line)] bg-[var(--surface)] hover:shadow-[var(--shadow-cafe)]",
        compact ? "pr-1" : "pr-3"
      )}
    >
      <span className="relative flex h-8 w-[68px] items-center overflow-hidden rounded-full bg-[var(--surface-2)]">
        {/* sliding knob */}
        <span
          className={cx(
            "absolute top-1 h-6 w-6 rounded-full shadow-md transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            isNight ? "left-[38px] bg-[#e8b86d]" : "left-1 bg-[#e8a13c]"
          )}
        />
        <Sun
          className={cx(
            "absolute left-[9px] h-3.5 w-3.5 transition-colors duration-500",
            isNight ? "text-[var(--muted)]" : "text-white"
          )}
          strokeWidth={2.5}
        />
        <Moon
          className={cx(
            "absolute right-[9px] h-3.5 w-3.5 transition-colors duration-500",
            isNight ? "text-[#1d130a]" : "text-[var(--muted)]"
          )}
          strokeWidth={2.5}
        />
      </span>
      {!compact && (
        <span className="text-xs font-semibold tracking-wide text-[var(--ink-soft)] uppercase">
          {isNight ? "Night" : "Day"}
        </span>
      )}
    </button>
  );
}

/** Ambient café backdrop — warm sunlight (day) / stars + lamplight (night). */
export function CafeBackdrop() {
  const { theme } = useTheme();
  const isNight = theme === "night";
  const stars = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => ({
        id: i,
        left: `${(i * 37.7 + 11) % 100}%`,
        top: `${(i * 23.3 + 5) % 55}%`,
        size: (i % 3) + 1,
        delay: `${(i % 12) * 0.35}s`,
      })),
    []
  );
  const motes = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: `${(i * 53.3 + 7) % 100}%`,
        top: `${(i * 31.7 + 12) % 80}%`,
        delay: `${(i % 7) * 0.8}s`,
      })),
    []
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Day: sunlight wash from café window */}
      <div
        className={cx(
          "absolute inset-0 transition-opacity duration-1000",
          isNight ? "opacity-0" : "opacity-100"
        )}
        style={{
          background:
            "radial-gradient(1100px 520px at 12% -8%, rgba(232,161,60,0.22), transparent 60%), radial-gradient(900px 500px at 88% 8%, rgba(214,164,110,0.16), transparent 60%)",
        }}
      />
      {/* Day: window light beams */}
      <div
        className={cx(
          "absolute -top-24 -left-24 h-[130%] w-[46%] rotate-[14deg] blur-2xl transition-opacity duration-1000",
          isNight ? "opacity-0" : "opacity-100 animate-sun-shift"
        )}
        style={{ background: "linear-gradient(180deg, rgba(255,236,200,0.5), transparent 70%)" }}
      />
      {/* Day: floating dust motes */}
      {!isNight &&
        motes.map((m) => (
          <span
            key={m.id}
            className="absolute h-1 w-1 rounded-full bg-[#c99a5b]/50 animate-drift"
            style={{ left: m.left, top: m.top, animationDelay: m.delay }}
          />
        ))}

      {/* Night: deep sky + warm lamp glow */}
      <div
        className={cx(
          "absolute inset-0 transition-opacity duration-1000",
          isNight ? "opacity-100" : "opacity-0"
        )}
        style={{
          background:
            "radial-gradient(1000px 600px at 82% -10%, rgba(64,72,120,0.5), transparent 60%), radial-gradient(700px 420px at 50% 108%, rgba(224,164,88,0.16), transparent 62%)",
        }}
      />
      {/* Night: moon */}
      <div
        className={cx(
          "absolute top-10 right-[12%] h-14 w-14 rounded-full transition-all duration-1000",
          isNight ? "opacity-100 scale-100" : "opacity-0 scale-75"
        )}
        style={{
          background: "radial-gradient(circle at 35% 35%, #fdf3dd, #ecd3a3 65%, #d9b47e)",
          boxShadow: "0 0 40px 10px rgba(236,211,163,0.25)",
        }}
      />
      {/* Night: stars */}
      {isNight &&
        stars.map((s) => (
          <span
            key={s.id}
            className="absolute rounded-full bg-[#f5e7c8] animate-twinkle"
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              animationDelay: s.delay,
            }}
          />
        ))}
    </div>
  );
}
