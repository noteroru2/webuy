// src/lib/jsonld-review.ts – AggregateRating on LocalBusiness (type-safe)
import type { JsonLdThing } from "./jsonld/types";

export type AggregateRatingOpts = {
  ratingValue?: number;
  reviewCount?: number;
  enabled?: boolean;
};

/**
 * Returns a LocalBusiness schema with only name + aggregateRating (for pages that don’t need full address).
 * Prefer embedding rating via jsonLdLocalBusiness(site, pageUrl, area, rating) so one LocalBusiness has both.
 */
export function jsonLdAggregateRating(opts?: AggregateRatingOpts): JsonLdThing | null {
  if (opts?.enabled === false) return null;

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "WEBUY HUB",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: opts?.ratingValue ?? 4.9,
      reviewCount: opts?.reviewCount ?? 128,
    },
  };
}
