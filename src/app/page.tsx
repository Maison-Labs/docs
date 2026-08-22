import Link from "next/link";
import { docApps } from "@/lib/registry";
import { listOperations } from "@/lib/openapi";

const guides = [
  {
    href: "/guides/authentication",
    icon: "🪪",
    title: "User authentication",
    blurb: "Sign-in, sessions, minting JWTs and validating them against the portal JWKS.",
  },
  {
    href: "/guides/machine-credentials",
    icon: "🤖",
    title: "Machine credentials",
    blurb: "API keys and OAuth client-credentials for services calling Maison apps.",
  },
  {
    href: "/guides/local-development",
    icon: "🛠️",
    title: "Local development",
    blurb: "The shared database container, app onboarding, and wiring an app to the portal.",
  },
];

/** Landing: API reference per app, plus the developer guides. */
export default function Home() {
  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="mb-1" style={{ fontSize: "var(--m-text-2xl)", fontWeight: "var(--m-weight-bold)" }}>
        Maison developer documentation
      </h1>
      <p className="m-subtitle mb-8" style={{ maxWidth: "44rem" }}>
        Every Maison standalone app publishes an OpenAPI contract. Browse the reference by app,
        try requests live, and read the guides for the concepts that span all apps.
      </p>

      <h2 className="mb-3" style={{ fontSize: "var(--m-text-lg)", fontWeight: "var(--m-weight-semibold)" }}>
        API reference
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {docApps.map((app) => (
          <Link key={app.slug} href={`/reference/${app.slug}`} className="app-tile">
            <div style={{ fontSize: "var(--m-text-2xl)" }}>{app.icon}</div>
            <div style={{ fontWeight: "var(--m-weight-semibold)" }}>{app.name}</div>
            <div className="m-subtitle">{app.description}</div>
            <div className="m-subtitle" style={{ fontSize: "var(--m-text-xs)" }}>
              {listOperations(app.spec).length} endpoints · OpenAPI {app.spec.openapi}
            </div>
          </Link>
        ))}
      </div>

      <h2 className="mb-3" style={{ fontSize: "var(--m-text-lg)", fontWeight: "var(--m-weight-semibold)" }}>
        Guides
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {guides.map((guide) => (
          <Link key={guide.href} href={guide.href} className="app-tile">
            <div style={{ fontSize: "var(--m-text-2xl)" }}>{guide.icon}</div>
            <div style={{ fontWeight: "var(--m-weight-semibold)" }}>{guide.title}</div>
            <div className="m-subtitle">{guide.blurb}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
