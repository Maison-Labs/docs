"use client";

import { useEffect, useMemo, useState } from "react";
import { type DocApp } from "@/lib/registry";
import { type OpenApiSpec, groupByTag } from "@/lib/openapi";
import { MethodBadge } from "./MethodBadge";
import { OperationDoc } from "./OperationDoc";

/**
 * The API reference for one app: sidebar of operations grouped by tag
 * (collapsing to a drawer on mobile), operation detail with a try-it console.
 * The selected operation is kept in the URL hash for deep-linking. When the
 * app declares a live specUrl, the freshest spec is fetched at load, falling
 * back to the bundled copy.
 */
export function ReferenceShell({ app }: { app: DocApp }) {
  const [spec, setSpec] = useState<OpenApiSpec>(app.spec);
  const [menuOpen, setMenuOpen] = useState(false);
  const groups = useMemo(() => groupByTag(spec), [spec]);
  const allOps = useMemo(() => groups.flatMap((g) => g.operations), [groups]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // The URL hash is only readable after mount (pages are prerendered), so the
  // initial selection has to be synced in an effect.
  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    const fromHash = window.location.hash.slice(1);
    if (fromHash && allOps.some((o) => o.id === fromHash)) setSelectedId(fromHash);
    else if (allOps.length > 0) setSelectedId(allOps[0].id);
  }, [allOps.length]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  useEffect(() => {
    if (!app.specUrl) return;
    const controller = new AbortController();
    fetch(app.specUrl, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((live) => {
        if (live?.openapi && live?.paths) setSpec(live as OpenApiSpec);
      })
      .catch(() => {
        // Offline app — the bundled spec stays in place.
      });
    return () => controller.abort();
  }, [app.specUrl]);

  const selected = allOps.find((o) => o.id === selectedId) ?? allOps[0];

  function select(id: string) {
    setSelectedId(id);
    setMenuOpen(false);
    history.replaceState(null, "", `#${id}`);
  }

  return (
    <div className="ref-layout">
      <div className="md:hidden col-span-full" style={{ display: "contents" }}>
        <button className="m-btn-secondary ref-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          ☰ {menuOpen ? "Close" : "Browse endpoints"}
        </button>
      </div>

      <nav className={`ref-sidebar${menuOpen ? " open" : ""}`}>
        <div className="mb-2">
          <span style={{ fontSize: "var(--m-text-lg)" }}>{app.icon}</span>{" "}
          <span style={{ fontWeight: "var(--m-weight-semibold)" }}>{app.name}</span>
          <div className="m-subtitle" style={{ fontSize: "var(--m-text-xs)" }}>
            OpenAPI {spec.openapi} · v{spec.info.version}
          </div>
        </div>
        {groups.map((group) => (
          <div key={group.tag}>
            <div className="tag-title">{group.tag}</div>
            {group.operations.map((op) => (
              <button
                key={op.id}
                className={`op-link${selected?.id === op.id ? " active" : ""}`}
                onClick={() => select(op.id)}
              >
                <MethodBadge method={op.method} />
                <span className="truncate">{op.op.summary ?? op.path}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>

      <main className="min-w-0">
        {selected ? (
          <OperationDoc key={selected.id} spec={spec} operation={selected} />
        ) : (
          <p className="m-subtitle">This spec declares no operations.</p>
        )}
      </main>
    </div>
  );
}
