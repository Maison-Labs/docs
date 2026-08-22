"use client";

import { useMemo, useState } from "react";
import {
  type OpenApiSpec,
  type Operation,
  exampleFromSchema,
  resolveSchema,
} from "@/lib/openapi";

type ResponseInfo = {
  status: number;
  statusText: string;
  timeMs: number;
  body: string;
  error?: string;
};

/**
 * Interactive console: fill parameters and auth, send the real request from
 * the browser, inspect the response. Requests go straight to the target
 * server, so its origin allow-list must include this docs app (Maison apps
 * onboarded via maison-apps.json already do).
 */
export function TryIt({ spec, operation }: { spec: OpenApiSpec; operation: Operation }) {
  const servers = spec.servers?.map((s) => s.url) ?? [];
  const [server, setServer] = useState(servers[0] ?? "");
  const [auth, setAuth] = useState("");
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [response, setResponse] = useState<ResponseInfo | null>(null);

  const params = operation.op.parameters ?? [];
  const bodySchema = operation.op.requestBody?.content?.["application/json"];

  const defaultBody = useMemo(() => {
    if (!bodySchema) return "";
    const example =
      bodySchema.example ?? exampleFromSchema(spec, resolveSchema(spec, bodySchema.schema));
    return JSON.stringify(example, null, 2);
  }, [spec, bodySchema]);

  const [body, setBody] = useState(defaultBody);

  async function send() {
    setBusy(true);
    setResponse(null);
    const started = performance.now();
    try {
      let path = operation.path;
      const query = new URLSearchParams();
      for (const p of params) {
        const value = paramValues[p.name];
        if (!value) continue;
        if (p.in === "path") path = path.replace(`{${p.name}}`, encodeURIComponent(value));
        if (p.in === "query") query.set(p.name, value);
      }
      const url = `${server.replace(/\/$/, "")}${path}${query.size ? `?${query}` : ""}`;

      const headers: Record<string, string> = {};
      if (auth) headers.Authorization = auth.startsWith("Bearer ") || auth.startsWith("ApiKey ") ? auth : `Bearer ${auth}`;
      for (const p of params) {
        if (p.in === "header" && paramValues[p.name]) headers[p.name] = paramValues[p.name];
      }

      const init: RequestInit = { method: operation.method.toUpperCase(), headers, credentials: "include" };
      if (bodySchema && body.trim()) {
        headers["Content-Type"] = "application/json";
        init.body = body;
      }

      const res = await fetch(url, init);
      const text = await res.text();
      let pretty = text;
      try {
        pretty = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        // leave non-JSON bodies as-is
      }
      setResponse({
        status: res.status,
        statusText: res.statusText,
        timeMs: Math.round(performance.now() - started),
        body: pretty,
      });
    } catch (error) {
      setResponse({
        status: 0,
        statusText: "",
        timeMs: Math.round(performance.now() - started),
        body: "",
        error:
          `${(error as Error).message}. ` +
          "If this is a CORS failure, the target app's origin allow-list (maison-apps.json) must include this docs app's origin.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="tryit mt-4">
      <h4 className="mb-3" style={{ fontWeight: "var(--m-weight-semibold)" }}>
        Try it
      </h4>
      <div className="flex flex-col gap-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="m-label">Server</label>
            {servers.length > 1 ? (
              <select className="m-input" value={server} onChange={(e) => setServer(e.target.value)}>
                {servers.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            ) : (
              <input className="m-input" value={server} onChange={(e) => setServer(e.target.value)} />
            )}
          </div>
          <div>
            <label className="m-label">Authorization (optional)</label>
            <input
              className="m-input"
              placeholder="Bearer eyJ…   or   mk_…"
              value={auth}
              onChange={(e) => setAuth(e.target.value)}
            />
          </div>
        </div>

        {params.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-3">
            {params.map((p) => (
              <div key={`${p.in}-${p.name}`}>
                <label className="m-label">
                  {p.name} <span className="m-subtitle">({p.in})</span>
                  {p.required && <span style={{ color: "var(--m-error)" }}> *</span>}
                </label>
                <input
                  className="m-input"
                  placeholder={p.description ?? ""}
                  value={paramValues[p.name] ?? ""}
                  onChange={(e) => setParamValues({ ...paramValues, [p.name]: e.target.value })}
                />
              </div>
            ))}
          </div>
        )}

        {bodySchema && (
          <div>
            <label className="m-label">Request body (JSON)</label>
            <textarea
              className="m-input"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              spellCheck={false}
            />
          </div>
        )}

        <div>
          <button className="m-btn" onClick={send} disabled={busy || !server}>
            {busy ? "Sending…" : "Send request"}
          </button>
        </div>

        {response && (
          <div className="response-block">
            {response.error ? (
              <div className="error-box">{response.error}</div>
            ) : (
              <>
                <div className="mb-2 flex items-center gap-3">
                  <span className={`status-pill ${response.status < 400 ? "status-ok" : "status-err"}`}>
                    {response.status} {response.statusText}
                  </span>
                  <span className="m-subtitle">{response.timeMs} ms</span>
                </div>
                <pre className="m-pre" style={{ margin: 0 }}>
                  {response.body || "(empty body)"}
                </pre>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
