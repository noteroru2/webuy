# WEBUY G0 — General Trust + Homepage Hygiene

Date: 2026-09-09 (Asia/Bangkok)
Base: WEBUY W5 source on main

## Verdict

`SOURCE_CLEANUP_COMPLETE / W5_OBSERVATION_NOT_STARTED`

G0 runs before the W5 production fingerprint is allowed to start the observation clock.

## Changes

### Homepage trust cleanup
- Removed hard-coded review score, review count/customer count, 24/7 claim, 100% safety claim, best-price claim and fixed 5-minute response promises.
- Removed fabricated/unverifiable testimonial cards.
- Kept the core customer journey: send real product information, receive a preliminary range, inspect the device, confirm price and pay.
- Replaced first-eight-service selection with a category-diverse service shortlist so the homepage does not show a repetitive single-category/cross-brand cluster.
- Kept the existing homepage H1 intent and primary LINE conversion path.

### Shared layout
- Added Open Graph and Twitter card metadata using the existing `/og.jpg` asset.
- Reworded the LINE contact card to avoid a fixed response-time promise.
- Kept actual storefront hours from `BUSINESS_INFO` visible.

### Category public-copy hygiene
- Removed visible route slugs and English/internal labels such as Services, Locations, Price Models and FAQ navigation jargon.
- Replaced internal wording with customer-facing Thai.
- Visible FAQ content remains.

### Location public-copy hygiene
- Preserved location H1, route ownership and W1/W2 optimization blocks.
- Suppressed Latin-only district system labels from the public area line (for example `Mueang Maha Sarakham`).
- Removed visible raw `/services/{slug}` paths from cards.

### Structured data
- Removed the WebSite SearchAction because the target `/categories?q=...` is not an implemented site-search experience.
- Kept Organization and WebSite identity markup.

## Not changed in G0
- No location canonical changes.
- No location H1/title bulk rewrite.
- No service/location redirect consolidation.
- No mass noindex/GONE actions.
- No generated WordPress content rewrite.

## Follow-up items

### Legacy `?p=` URLs
Public search snapshots still surface historical WordPress query URLs such as `/?p=1437`, but current 28-day GSC returns no `?p=` page rows. Do not add a guessed query-string redirect in source. Verify Cloudflare redirect behavior first and only consolidate exact legacy IDs when platform behavior is proven.

### Conversion measurement
`src/lib/gtag.ts` is a stale helper using a Next.js-style environment variable and is not wired into the Astro layout. No GA4 Measurement ID is present in the production env file. Implement LINE/phone CTA measurement only after a real GA4 Measurement ID/account is available; never invent one.

## W5 consequence

The W5 production fingerprint must be refreshed to identify the final behavior source including G0. Observation remains INACTIVE until the refreshed fingerprint is confirmed on production.