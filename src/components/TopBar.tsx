import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

/** Global top navigation. */
export function TopBar() {
  return (
    <header className="topbar">
      <div className="flex items-center gap-3 min-w-0">
        <Link href="/" className="m-brand shrink-0" style={{ fontSize: "var(--m-text-xl)" }}>
          Maison
        </Link>
        <span className="m-subtitle truncate">API Docs</span>
      </div>
      <nav className="flex items-center gap-4" style={{ fontSize: "var(--m-text-sm)" }}>
        <Link className="m-link" href="/">
          Reference
        </Link>
        <Link className="m-link hidden sm:inline" href="/guides/authentication">
          Guides
        </Link>
        <maison-org-switcher />
        <ThemeToggle />
        <maison-app-switcher />
        <maison-account-badge />
      </nav>
    </header>
  );
}
