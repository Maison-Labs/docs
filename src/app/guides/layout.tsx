import Link from "next/link";

const pages = [
  { href: "/guides/authentication", label: "User authentication" },
  { href: "/guides/machine-credentials", label: "Machine credentials" },
  { href: "/guides/local-development", label: "Local development" },
];

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-5xl mx-auto p-6 flex flex-col md:flex-row gap-6 md:gap-10">
      <nav
        className="md:w-48 shrink-0 flex flex-row md:flex-col flex-wrap gap-3 md:gap-2 md:pt-1"
        style={{ fontSize: "var(--m-text-sm)" }}
      >
        {pages.map((p) => (
          <Link key={p.href} className="m-link" href={p.href}>
            {p.label}
          </Link>
        ))}
      </nav>
      <article className="docs-content min-w-0 flex-1">{children}</article>
    </div>
  );
}
