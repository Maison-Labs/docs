# maison-app-docs — working notes

Documentation app for the Maison app factory. Next.js 16 CSR, no DB, no auth, port **8181**.
Read README.md for the add-an-app workflow.

- Specs live in `specs/<slug>.json` (OpenAPI 3), registered in `src/lib/registry.ts`.
  The reference fetches the live `specUrl` at load and falls back to the bundled copy.
  Registered apps: `portal` (8180) and `table` (8182, `NEXT_PUBLIC_TABLE_URL`). Refresh a
  bundled spec by curling the app's live `/api/v1/openapi.json` into `specs/<slug>.json`.
- `src/lib/openapi.ts` implements the pragmatic OpenAPI subset we render (local $refs,
  JSON bodies, tags). Extend it there rather than pulling in swagger-ui.
- Theme: vendored Maison `--m-*` tokens in globals.css (same file as the portal's plus
  docs-specific classes at the bottom). Never hardcode colors; keep light/dark parity.
  The theme follows the shared `maison-theme` key (cookie + localStorage; bootstrap in
  layout.tsx) so the choice carries across all Maison apps.
- The top bar embeds the portal-served shared header components (app switcher, account
  badge — from `{PORTAL_URL}/app-switcher.js`; JSX declarations in src/types/). Change
  them in the portal repo, never here.
- Try-it uses plain fetch with `credentials: "include"`; CORS is granted by the portal's
  maison-apps.json origin allow-list — this app is onboarded there as slug `docs`.
- Mobile: `.ref-layout` collapses at 900px; the sidebar becomes a fixed drawer.
