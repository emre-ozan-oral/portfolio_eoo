"use client";

import { useState } from "react";
import ZipGame from "./ZipGame";
import SolverView from "./SolverView";

const TABS = [
  { key: "play", label: "Play" },
  { key: "solver", label: "Watch solver" },
] as const;

export default function ZipTabs() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("play");

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="flex items-center gap-1 border border-[var(--border)] p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-5 py-2 text-[11px] tracking-[0.18em] uppercase transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 ${
              tab === t.key ? "bg-[var(--accent)] text-[var(--bg)]" : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "play" ? <ZipGame /> : <SolverView />}
    </div>
  );
}
