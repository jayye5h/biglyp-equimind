import { RotateCcw } from "lucide-react";

export const rand = (n) => Math.floor(Math.random() * n);
export const shuffle = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((x) => x[1]);

/** Shared frame for every mini game: hint line, play area, status line, reset link. */
export const GameFrame = ({ id, hint, status, onReset, resetLabel = "Play again", children }) => (
  <div data-testid={`game-${id}`} className="text-center select-none">
    {hint && <p className="text-sm text-slate-500">{hint}</p>}
    <div className="mt-4">{children}</div>
    {status != null && <p data-testid={`${id}-status`} className="mt-4 text-sm font-medium text-slate-700">{status}</p>}
    {onReset && (
      <button data-testid={`${id}-reset`} onClick={onReset} className="mt-2 text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1">
        <RotateCcw className="h-3 w-3" /> {resetLabel}
      </button>
    )}
  </div>
);

export const Btn = ({ children, className = "", ...p }) => (
  <button {...p} className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-40 ${className || "bg-eq text-white hover:bg-eq-dark"}`}>{children}</button>
);
