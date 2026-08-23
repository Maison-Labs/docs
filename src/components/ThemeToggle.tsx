"use client";

import { useSyncExternalStore } from "react";

const THEME_KEY = "maison-theme";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function currentTheme(): "light" | "dark" {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

/** Moon/sun toggle matching the maison-agent login app; persists the shared theme key. */
export function ThemeToggle() {
  // Server snapshot is null so SSR markup stays theme-agnostic until hydration.
  const theme = useSyncExternalStore(subscribe, currentTheme, () => null);

  function toggle() {
    const next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_KEY, next);
      const host = location.hostname;
      // Domain-wide on real domains so sibling apps (table., docs., …) share it
      const domain =
        host === "localhost" || /^[0-9.:]+$/.test(host) || !host.includes(".")
          ? ""
          : `; domain=.${host.split(".").slice(-2).join(".")}`;
      document.cookie = `${THEME_KEY}=${next}; max-age=31536000; path=/${domain}; SameSite=Lax`;
    } catch {
      // storage unavailable — the attribute alone still themes this page
    }
    listeners.forEach((l) => l());
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title="Toggle theme"
      onClick={toggle}
    >
      {theme === "dark" ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
