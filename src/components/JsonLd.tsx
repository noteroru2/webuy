// src/components/JsonLd.tsx – type-safe JSON-LD script (object, array, or pre-stringified string)
import type { JsonLdPayload } from "@/lib/jsonld/types";

function toScriptContent(json: JsonLdPayload): string | null {
  if (json == null) return null;
  if (typeof json === "string") return json;
  try {
    return JSON.stringify(json);
  } catch {
    return null;
  }
}

export function JsonLd({ json }: { json?: JsonLdPayload }) {
  const content = toScriptContent(json ?? null);
  if (!content) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

export default JsonLd;
