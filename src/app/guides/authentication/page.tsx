import Link from "next/link";
import { PORTAL_URL } from "@/lib/registry";

export default function AuthenticationGuide() {
  return (
    <>
      <h1>User authentication</h1>
      <p>
        Users sign in once at the portal. Apps never implement their own login — they redirect to
        the portal and validate the JWTs it issues. The interactive reference for every endpoint
        below is in <Link className="m-link" href="/reference/portal">the portal API reference</Link>.
      </p>

      <h2>Sign in</h2>
      <pre className="m-pre">{`POST ${PORTAL_URL}/api/auth/sign-in/email
Content-Type: application/json

{ "email": "user@example.com", "password": "..." }`}</pre>
      <p>
        On success a session cookie is set. The session is the long-lived credential — the
        &quot;refresh token&quot; in OAuth terms.
      </p>

      <h2>Get an ID token (JWT) from the session</h2>
      <pre className="m-pre">{`GET ${PORTAL_URL}/api/auth/token
Cookie: <session cookie>        # or Authorization: Bearer <session token>

→ { "token": "eyJhbGciOiJFZERTQSIs..." }`}</pre>
      <p>
        Tokens live 15 minutes. Call this endpoint again whenever a token expires — the session
        keeps refreshing it, and each fresh token picks up any access changes.
      </p>

      <h2>Token claims</h2>
      <pre className="m-pre">{`{
  "sub":   "<user id>",
  "email": "user@example.com",
  "name":  "User Name",
  "role":  "user" | "admin",
  "apps":  ["table", "pms"],          // app slugs this user may access
  "iss":   "${PORTAL_URL}",
  "aud":   "maison-apps",
  "exp":   ...
}`}</pre>

      <h2>Validating a token in your app</h2>
      <p>
        Verify against the portal&apos;s key set at the standard well-known location,{" "}
        <code className="m-code">GET /.well-known/jwks.json</code> (also served at{" "}
        <code className="m-code">/api/auth/jwks</code>). With <code className="m-code">jose</code>:
      </p>
      <pre className="m-pre">{`import { createRemoteJWKSet, jwtVerify } from "jose";

const JWKS = createRemoteJWKSet(new URL(\`\${PORTAL_URL}/.well-known/jwks.json\`));

export async function verifyMaisonToken(token: string, myAppSlug: string) {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: PORTAL_URL,
    audience: "maison-apps",
  });
  const apps = (payload.apps ?? []) as string[];
  if (!apps.includes("*") && !apps.includes(myAppSlug)) {
    throw new Error("No access to this app");
  }
  return payload; // sub, email, name, role — or machine claims
}`}</pre>
      <p>
        Access revocation takes effect on the next token refresh; already-issued tokens stay valid
        until they expire (≤15 minutes for users, ≤1 hour for machines).
      </p>
    </>
  );
}
