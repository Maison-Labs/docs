import type { OpenApiSpec } from "./openapi";
import portalSpec from "../../specs/portal.json";

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
];

export function getDocApp(slug: string): DocApp | undefined {
  return docApps.find((a) => a.slug === slug);
}
