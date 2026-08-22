/**
 * A pragmatic OpenAPI 3.0 model + helpers covering the subset Maison app
 * specs use: tags, path operations, parameters, JSON request bodies, JSON
 * responses, local $refs and securitySchemes.
 */

export type SchemaObject = {
  $ref?: string;
  type?: string;
  format?: string;
  description?: string;
  properties?: Record<string, SchemaObject>;
  items?: SchemaObject;
  required?: string[];
  enum?: unknown[];
  example?: unknown;
  default?: unknown;
  nullable?: boolean;
  minLength?: number;
  minItems?: number;
  pattern?: string;
};

export type ParameterObject = {
  name: string;
  in: "query" | "path" | "header" | "cookie";
  required?: boolean;
  description?: string;
  schema?: SchemaObject;
};

export type MediaTypeObject = { schema?: SchemaObject; example?: unknown };

export type RequestBodyObject = {
  required?: boolean;
  description?: string;
  content?: Record<string, MediaTypeObject>;
};

export type ResponseObject = {
  $ref?: string;
  description?: string;
  content?: Record<string, MediaTypeObject>;
};

export type OperationObject = {
  tags?: string[];
  operationId?: string;
  summary?: string;
  description?: string;
  parameters?: ParameterObject[];
  requestBody?: RequestBodyObject;
  responses?: Record<string, ResponseObject>;
  security?: Record<string, string[]>[];
};

export type OpenApiSpec = {
  openapi: string;
  info: { title: string; version: string; description?: string };
  servers?: { url: string; description?: string }[];
  tags?: { name: string; description?: string }[];
  paths: Record<string, Partial<Record<string, OperationObject>>>;
  components?: {
    schemas?: Record<string, SchemaObject>;
    responses?: Record<string, ResponseObject>;
    securitySchemes?: Record<
      string,
      { type: string; scheme?: string; in?: string; name?: string; description?: string }
    >;
  };
};

export const HTTP_METHODS = ["get", "post", "put", "patch", "delete"] as const;
export type HttpMethod = (typeof HTTP_METHODS)[number];

export type Operation = {
  id: string;
  method: HttpMethod;
  path: string;
  op: OperationObject;
  tag: string;
};

/** Resolve a local "#/components/..." reference. */
export function resolveRef<T>(spec: OpenApiSpec, ref: string): T | undefined {
  if (!ref.startsWith("#/")) return undefined;
  let node: unknown = spec;
  for (const part of ref.slice(2).split("/")) {
    if (node && typeof node === "object") {
      node = (node as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return node as T;
}

export function resolveSchema(spec: OpenApiSpec, schema?: SchemaObject): SchemaObject | undefined {
  if (!schema) return undefined;
  if (schema.$ref) return resolveRef<SchemaObject>(spec, schema.$ref) ?? schema;
  return schema;
}

export function resolveResponse(spec: OpenApiSpec, response: ResponseObject): ResponseObject {
  if (response.$ref) return resolveRef<ResponseObject>(spec, response.$ref) ?? response;
  return response;
}

/** All operations of a spec, in path order. */
export function listOperations(spec: OpenApiSpec): Operation[] {
  const ops: Operation[] = [];
  for (const [path, item] of Object.entries(spec.paths)) {
    for (const method of HTTP_METHODS) {
      const op = item[method];
      if (!op) continue;
      ops.push({
        id: op.operationId ?? `${method}-${path.replace(/[^a-zA-Z0-9]+/g, "-")}`,
        method,
        path,
        op,
        tag: op.tags?.[0] ?? "Other",
      });
    }
  }
  return ops;
}

/** Operations grouped by tag, following the spec's declared tag order. */
export function groupByTag(spec: OpenApiSpec): { tag: string; description?: string; operations: Operation[] }[] {
  const ops = listOperations(spec);
  const declared = spec.tags?.map((t) => t.name) ?? [];
  const tagNames = [...declared, ...ops.map((o) => o.tag).filter((t) => !declared.includes(t))];
  const seen = new Set<string>();
  const groups: { tag: string; description?: string; operations: Operation[] }[] = [];
  for (const tag of tagNames) {
    if (seen.has(tag)) continue;
    seen.add(tag);
    const operations = ops.filter((o) => o.tag === tag);
    if (operations.length === 0) continue;
    groups.push({ tag, description: spec.tags?.find((t) => t.name === tag)?.description, operations });
  }
  return groups;
}

/** Build a plausible example value from a schema (used to prefill Try-it bodies). */
export function exampleFromSchema(spec: OpenApiSpec, schema?: SchemaObject, depth = 0): unknown {
  const s = resolveSchema(spec, schema);
  if (!s || depth > 6) return null;
  if (s.example !== undefined) return s.example;
  if (s.default !== undefined) return s.default;
  if (s.enum?.length) return s.enum[0];
  switch (s.type) {
    case "object": {
      const out: Record<string, unknown> = {};
      for (const [key, prop] of Object.entries(s.properties ?? {})) {
        out[key] = exampleFromSchema(spec, prop, depth + 1);
      }
      return out;
    }
    case "array":
      return [exampleFromSchema(spec, s.items, depth + 1)];
    case "integer":
    case "number":
      return 0;
    case "boolean":
      return true;
    case "string":
      switch (s.format) {
        case "email":
          return "user@example.com";
        case "uuid":
          return "00000000-0000-0000-0000-000000000000";
        case "date-time":
          return new Date(0).toISOString();
        case "uri":
          return "https://example.com";
        case "password":
          return "";
        default:
          return "string";
      }
    default:
      return null;
  }
}

/** Human-readable type label for schema tables. */
export function schemaTypeLabel(spec: OpenApiSpec, schema?: SchemaObject): string {
  const s = resolveSchema(spec, schema);
  if (!s) return "unknown";
  if (s.enum?.length) return s.enum.map((v) => JSON.stringify(v)).join(" | ");
  if (s.type === "array") return `${schemaTypeLabel(spec, s.items)}[]`;
  if (s.type === "object" || (!s.type && s.properties)) return "object";
  let label = s.type ?? "unknown";
  if (s.format) label += ` (${s.format})`;
  if (s.nullable) label += " | null";
  return label;
}
