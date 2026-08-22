import {
  type OpenApiSpec,
  type Operation,
  resolveResponse,
  resolveSchema,
  schemaTypeLabel,
} from "@/lib/openapi";
import { MethodBadge } from "./MethodBadge";
import { SchemaView } from "./SchemaView";
import { TryIt } from "./TryIt";

/** Full documentation for one operation: description, params, body, responses, try-it. */
export function OperationDoc({ spec, operation }: { spec: OpenApiSpec; operation: Operation }) {
  const { op } = operation;
  const params = op.parameters ?? [];
  const bodyMedia = op.requestBody?.content?.["application/json"];
  const bodySchema = resolveSchema(spec, bodyMedia?.schema);
  const security = op.security?.flatMap((s) => Object.keys(s)) ?? [];

  return (
    <section>
      <h2 className="mb-1" style={{ fontSize: "var(--m-text-xl)", fontWeight: "var(--m-weight-bold)" }}>
        {op.summary ?? operation.id}
      </h2>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <MethodBadge method={operation.method} />
        <code className="op-path">{operation.path}</code>
        {security.map((scheme) => (
          <span key={scheme} className="m-chip" title={spec.components?.securitySchemes?.[scheme]?.description}>
            🔒 {scheme}
          </span>
        ))}
      </div>
      {op.description && (
        <p className="m-subtitle mb-4" style={{ maxWidth: "48rem" }}>
          {op.description}
        </p>
      )}

      {params.length > 0 && (
        <>
          <h3 className="mt-5 mb-2" style={{ fontWeight: "var(--m-weight-semibold)" }}>
            Parameters
          </h3>
          <div className="param-table-wrap">
            <table className="m-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>In</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {params.map((p) => (
                  <tr key={`${p.in}-${p.name}`}>
                    <td>
                      <code className="m-code">{p.name}</code>
                      {p.required && <span className="prop-required"> *</span>}
                    </td>
                    <td>{p.in}</td>
                    <td className="prop-type">{schemaTypeLabel(spec, p.schema)}</td>
                    <td className="m-subtitle">{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {bodySchema && (
        <>
          <h3 className="mt-5 mb-2" style={{ fontWeight: "var(--m-weight-semibold)" }}>
            Request body{" "}
            <span className="m-subtitle" style={{ fontWeight: "var(--m-weight-normal)" }}>
              application/json{op.requestBody?.required ? " · required" : ""}
            </span>
          </h3>
          <SchemaView spec={spec} schema={bodySchema} />
        </>
      )}

      <h3 className="mt-5 mb-2" style={{ fontWeight: "var(--m-weight-semibold)" }}>
        Responses
      </h3>
      <div className="flex flex-col gap-3">
        {Object.entries(op.responses ?? {}).map(([code, raw]) => {
          const response = resolveResponse(spec, raw);
          const media = response.content?.["application/json"];
          const schema = resolveSchema(spec, media?.schema);
          const example = media?.example ?? schema?.example;
          return (
            <div key={code} className="response-block">
              <div className="flex items-center gap-2 mb-1">
                <span className={`status-pill ${code.startsWith("2") ? "status-ok" : "status-err"}`}>
                  {code}
                </span>
                <span className="m-subtitle">{response.description}</span>
              </div>
              {schema && <SchemaView spec={spec} schema={schema} />}
              {example !== undefined && (
                <pre className="m-pre" style={{ marginTop: "var(--m-sp-2)" }}>
                  {JSON.stringify(example, null, 2)}
                </pre>
              )}
            </div>
          );
        })}
      </div>

      <TryIt spec={spec} operation={operation} />
    </section>
  );
}
