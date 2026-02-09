// src/lib/jsonld/types.ts – type-safe JSON-LD for schema.org

export type JsonLdPrimitive = string | number | boolean | null;

/** Recursive value: primitive, object, or array of values. Use for flexible schema shapes. */
export type JsonLdValue =
  | JsonLdPrimitive
  | JsonLdObject
  | JsonLdValue[];

/** Schema.org-style object with @context, @type, and arbitrary props. */
export interface JsonLdObject {
  "@context"?: "https://schema.org" | string;
  "@type"?: string;
  "@id"?: string;
  [key: string]: JsonLdValue | undefined;
}

/**
 * A single schema entity (e.g. LocalBusiness, BreadcrumbList).
 * Use this as the return type for helpers that return one schema object or null.
 */
export type JsonLdThing = JsonLdObject;

/**
 * Payload suitable for the JsonLd component: one schema object, or array of schemas, or null.
 * Component will stringify object/array; if you pass a string it is used as-is (already stringified).
 */
export type JsonLdPayload = JsonLdThing | JsonLdThing[] | string | null;
