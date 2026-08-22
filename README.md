# maison-app-docs

Developer documentation for the **Maison standalone apps** — API reference grouped by app and
sub-group (OpenAPI tags), with an interactive try-it console, plus the cross-app developer
guides (authentication, machine credentials, local development).

- Every Maison app must publish an **OpenAPI 3** contract; this site renders those contracts.
- The reference always tries the app's **live** spec URL first (e.g. the portal's
  `/api/v1/openapi.json`) and falls back to the bundled copy in `specs/`.
- **Try it** sends real requests from the browser. Target apps allow this origin via the
  portal's app registry (`maison-apps.json`) — onboarded apps get CORS automatically.
- Maison brand theme (vendored `--m-*` tokens), light/dark with the shared `maison-theme`
  key, responsive down to phone widths (the endpoint sidebar becomes a drawer).

No database, no auth — this is a static-content app (CSR; not a system of record).
Runs on **port 8181** (Maison standalone apps use the 818X range).

## Local development

```bash
pnpm install
pnpm dev        # http://localhost:8181
```

`NEXT_PUBLIC_PORTAL_URL` (default `http://localhost:8180`) points links and the bundled
portal spec's live-fetch at the portal.

## Adding an app's API docs

1. Make the app publish its OpenAPI 3 JSON (convention: `GET /api/v1/openapi.json`).
2. Copy the spec into `specs/<slug>.json`.
3. Register it in `src/lib/registry.ts` with a `specUrl` for live fetching.
4. Endpoints appear grouped by the spec's `tags`; the first tag of each operation is its
   sub-group. Refresh the bundled copy whenever the contract changes meaningfully.

## Deployment

Same pattern as the other Maison apps: `Dockerfile` (standalone Next server on 8181) +
`buildspec.yml` pushing to ECR; run the container on the shared EC2 instance. Only the app is
deployed — there is no database.
