import type { OpenApiSpec } from "./openapi";
import portalSpec from "../../specs/portal.json";
import tableSpec from "../../specs/table.json";

/**
 * The documented Maison apps. To add an app: drop its OpenAPI 3 JSON into
 * specs/<slug>.json and add an entry here (every Maison app must publish an
 * OpenAPI contract — the portal serves its own at /api/v1/openapi.json).
 * `specUrl` is optional: when set, the reference page tries to fetch the live
 * spec from the running app and falls back to the bundled copy.
 */
export type DocApp = {
  slug: string;
  name: string;
  icon: string;
  description: string;
  spec: OpenApiSpec;
  specUrl?: string;
};

export const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL ?? "http://localhost:8180";
export const TABLE_URL = process.env.NEXT_PUBLIC_TABLE_URL ?? "http://localhost:8182";

export const docApps: DocApp[] = [
  {
    slug: "portal",
    name: "Maison Apps Portal",
    icon: "🔑",
    description:
      "Sign-in, JWT issuance and JWKS, per-user app access, and centrally managed machine credentials.",
    spec: portalSpec as unknown as OpenApiSpec,
    specUrl: `${PORTAL_URL}/api/v1/openapi.json`,
  },
  {
    slug: "table",
    name: "Table Management",
    icon: "🍽️",
    description:
      "Restaurant table inventory for hotel restaurants: availability with typed refusals, quote → hold → confirm reservations, declared seasons/services/pacing, and CSV/email ingestion.",
    spec: tableSpec as unknown as OpenApiSpec,
    specUrl: `${TABLE_URL}/api/v1/openapi.json`,
  },
];

export function getDocApp(slug: string): DocApp | undefined {
  return docApps.find((a) => a.slug === slug);
}
