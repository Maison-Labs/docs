# maison-app-docs — working notes

Documentation app for the Maison app factory. Next.js 16 CSR, no DB, no auth, port **8181**.
Read README.md for the add-an-app workflow.

- Specs live in `specs/<slug>.json` (OpenAPI 3), registered in `src/lib/registry.ts`.
  The reference fetches the live `specUrl` at load and falls back to the bundled copy.
- `src/lib/openapi.ts` implements the pragmatic OpenAPI subset we render (local $refs,
  JSON bodies, tags). Extend it there rather than pulling in swagger-ui.
- Theme: vendored Maison `--m-*` tokens in globals.css (same file as the portal's plus
  docs-specific classes at the bottom). Never hardcode colors; keep light/dark parity.
- Try-it uses plain fetch with `credentials: "include"`; CORS is granted by the portal's
  maison-apps.json origin allow-list — this app is onboarded there as slug `docs`.
- Mobile: `.ref-layout` collapses at 900px; the sidebar becomes a fixed drawer.
