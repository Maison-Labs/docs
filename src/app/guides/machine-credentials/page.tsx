import Link from "next/link";
import { PORTAL_URL } from "@/lib/registry";

export default function MachineCredentialsGuide() {
  return (
    <>
      <h1>Machine credentials</h1>
      <p>
        External services — the Maison agent runtime and any third-party system — authenticate to
        Maison apps with credentials managed centrally in the portal. Admins create them in the
        portal&apos;s admin console; each credential is scoped to one or many app slugs (
        <code className="m-code">*</code> = all apps). Try every endpoint below live in{" "}
        <Link className="m-link" href="/reference/portal">the portal API reference</Link>.
      </p>

      <h2>Option A — API key</h2>
      <p>
        A long-lived bearer key of the form <code className="m-code">mk_…</code>. The caller sends
        it on every request to the target app:
      </p>
      <pre className="m-pre">{`Authorization: Bearer mk_xxxxxxxxxxxxxxxxxxxx`}</pre>
      <p>The receiving app validates it with the portal (only the portal holds the key hashes):</p>
      <pre className="m-pre">{`POST ${PORTAL_URL}/api/v1/validate-credential
Content-Type: application/json

{ "authorization": "Bearer mk_xxxxxxxx", "app": "table" }

→ 200 { "valid": true,
        "principal": { "kind": "machine", "credentialType": "api_key",
                       "id": "...", "name": "maison-agent", "scopes": ["table"] } }
→ 401 { "valid": false, "reason": "out_of_scope" | "unknown_or_revoked_api_key" | ... }`}</pre>

      <h2>Option B — OAuth client credentials</h2>
      <p>
        A <code className="m-code">client_id</code> / <code className="m-code">client_secret</code>{" "}
        pair. The caller exchanges them for a short-lived JWT (1 hour), which target apps can
        validate <em>locally</em> against the portal JWKS — no per-request portal round-trip:
      </p>
      <pre className="m-pre">{`POST ${PORTAL_URL}/api/v1/oauth/token
Content-Type: application/json

{ "grant_type": "client_credentials",
  "client_id": "mc_...", "client_secret": "mcs_..." }

→ { "access_token": "eyJ...", "token_type": "Bearer", "expires_in": 3600 }`}</pre>
      <p>Machine token claims:</p>
      <pre className="m-pre">{`{
  "sub":  "machine:<credential id>",
  "type": "machine",
  "name": "maison-agent",
  "apps": ["table", "pms"],   // scoped app slugs
  "iss":  "${PORTAL_URL}",
  "aud":  "maison-apps"
}`}</pre>
      <p>
        <code className="m-code">/api/v1/validate-credential</code> also accepts these JWTs (and
        user JWTs), so an app can use one validation path for every incoming Authorization header.
      </p>

      <h2>Revocation</h2>
      <ul>
        <li>Revoked API keys fail validation immediately.</li>
        <li>
          Revoked OAuth clients can no longer mint tokens; outstanding tokens remain valid until
          expiry (≤1 hour).
        </li>
      </ul>
      <p>
        Secrets are returned exactly once, at creation, and stored only as hashes. Manage scopes
        and revocation in the portal admin console or via the admin endpoints.
      </p>
    </>
  );
}
