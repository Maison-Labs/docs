import { PORTAL_URL } from "@/lib/registry";

export default function LocalDevelopmentGuide() {
  return (
    <>
      <h1>Local development</h1>
      <p>
        All Maison standalone apps share <strong>one</strong> local Postgres container,{" "}
        <code className="m-code">maison-apps-db</code>, owned and started by the
        maison-apps-portal repo. Every app gets its own schema inside it — never the{" "}
        <code className="m-code">public</code> schema, and never another app&apos;s schema. In
        production only the app is deployed (EC2); the database is managed in Neon or AWS RDS.
        Apps serve on ports <code className="m-code">818X</code> (portal 8180, docs 8181, …).
      </p>

      <h2>Starting the shared database</h2>
      <pre className="m-pre">{`# from maison-apps-portal/
docker compose up -d --wait     # postgres 17 on localhost:5433 (db: maison_apps)`}</pre>

      <h2>Creating your app&apos;s schema and roles</h2>
      <pre className="m-pre">{`../maison-apps-portal/scripts/db/create-app-schema.sh <app>

#   <app>_admin — owns the schema; migrations ONLY
#   <app>_user  — runtime CRUD; what your app connects as`}</pre>
      <ul>
        <li>
          Run migrations through the <code className="m-code">_admin</code> connection string;
          point the running app at the <code className="m-code">_user</code> one.
        </li>
        <li>
          Both roles have <code className="m-code">search_path</code> set to your schema, so table
          names never need qualifying.
        </li>
        <li>
          Passing a connection string as the second argument targets a hosted environment (Neon
          staging/production or AWS RDS) instead of the local container.
        </li>
      </ul>

      <h2>Onboarding your app into the app factory</h2>
      <p>
        <code className="m-code">maison-apps.json</code> in the portal repo is the registry of the
        Maison app factory: the source of truth for which apps exist and which browser origins may
        call the portal APIs (cross-origin requests from unregistered domains are rejected).
      </p>
      <pre className="m-pre">{`# in maison-apps-portal/
pnpm onboard-app table --name "Table Management" --url https://table.maison-labs.com \\
  --icon 🍽️ --origins http://localhost:8182 \\
  --create-schema        # also create the app's DB schema + roles locally

pnpm apps:sync           # push hand-edits of maison-apps.json to the catalog`}</pre>

      <h2>Publishing your API docs</h2>
      <p>
        Every Maison app must publish an OpenAPI 3 contract (the portal serves its own at{" "}
        <code className="m-code">/api/v1/openapi.json</code>). To appear on this docs site, add
        the spec JSON to <code className="m-code">maison-app-docs/specs/</code> and register it in{" "}
        <code className="m-code">src/lib/registry.ts</code> — with a <code className="m-code">specUrl</code>{" "}
        so the reference always shows the live contract when the app is running.
      </p>

      <h2>Wiring your app to the portal</h2>
      <pre className="m-pre">{`PORTAL_URL=${PORTAL_URL}

# 1. Onboard the app (above) — it appears on the portal and as a credential scope.
# 2. Grant users access:  POST /api/v1/grant-app-access  { email, appSlug }
# 3. In your app: send users to the portal to sign in, then verify JWTs
#    against \${PORTAL_URL}/.well-known/jwks.json  (see "User authentication").`}</pre>
    </>
  );
}
