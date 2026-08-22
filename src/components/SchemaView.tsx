import {
  type OpenApiSpec,
  type SchemaObject,
  resolveSchema,
  schemaTypeLabel,
} from "@/lib/openapi";

/** Recursive property tree for an object/array schema. */
export function SchemaView({
  spec,
  schema,
  depth = 0,
}: {
  spec: OpenApiSpec;
  schema?: SchemaObject;
  depth?: number;
}) {
  const s = resolveSchema(spec, schema);
  if (!s || depth > 5) return null;

  if (s.type === "array") {
    return (
      <div className="schema-tree">
        <span className="prop-type">array of {schemaTypeLabel(spec, s.items)}</span>
        {isExpandable(spec, s.items) && (
          <div className="schema-nest">
            <SchemaView spec={spec} schema={s.items} depth={depth + 1} />
          </div>
        )}
      </div>
    );
  }

  const properties = Object.entries(s.properties ?? {});
  if (properties.length === 0) {
    return <div className="schema-tree prop-type">{schemaTypeLabel(spec, s)}</div>;
  }

  return (
    <div className="schema-tree">
      {properties.map(([name, prop]) => {
        const resolved = resolveSchema(spec, prop);
        const required = s.required?.includes(name);
        return (
          <div key={name} className="py-0.5">
            <span className="prop-name">{name}</span>{" "}
            <span className="prop-type">{schemaTypeLabel(spec, prop)}</span>{" "}
            {required && <span className="prop-required">required</span>}
            {resolved?.description && (
              <span className="m-subtitle"> — {resolved.description}</span>
            )}
            {isExpandable(spec, prop) && (
              <div className="schema-nest">
                <SchemaView spec={spec} schema={prop} depth={depth + 1} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function isExpandable(spec: OpenApiSpec, schema?: SchemaObject): boolean {
  const s = resolveSchema(spec, schema);
  if (!s) return false;
  if (s.type === "array") return isExpandable(spec, s.items);
  return Object.keys(s.properties ?? {}).length > 0;
}
