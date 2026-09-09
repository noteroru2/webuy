# WEBUY G1 — Conversion Measurement + Mobile CTA Instrumentation

Date: 2026-09-09 (Asia/Bangkok)
Behavior source: `d5177861673291b1b971e44386aee701e511e10b`

## Scope

G1 adds a sitewide conversion-measurement layer without changing Local/Service query ownership, H1 strategy, canonical behavior, index lifecycle, W1-W4 ranking copy, or the frozen W5 GSC baseline.

## Events

- `line_click` — a user clicks a LINE contact link.
- `phone_click` — a user clicks a `tel:` contact link.
- `cta_impression` — a designated primary contact CTA becomes at least 55% visible in the viewport.

Each event carries non-customer attribution fields:

- `page_path`
- `page_type` (`home`, `location`, `service`, `category`, `price`, `other`)
- `device_group` (`mobile`, `tablet`, `desktop`)
- `cta_location`
- `cta_label`
- `contact_method` for contact events

The instrumentation does not intentionally send customer names, phone numbers, product photos, chat messages, or form content as analytics parameters.

## Sitewide behavior

`src/components/ConversionTracking.astro` is mounted once in `BaseLayout.astro` and uses delegated click tracking so existing and dynamically rendered LINE/telephone links can be measured without editing every Local or Service page.

Primary CTA impressions are explicitly tagged for:

- top LINE banner
- main LINE banner
- persistent floating LINE button
- contact-section LINE and phone cards
- footer LINE and phone links

Other LINE and telephone links are still measured on click through delegated detection.

## Mobile UX change

The floating LINE button previously disappeared on screens below 640px after scrolling past 100px. G1 removes that scroll-hide behavior. The CTA remains available while a mobile user reads long Local/Service pages. Device segmentation is included in every analytics event so mobile performance can be evaluated separately.

## GA4 activation

GA4 loads only when a valid Web stream Measurement ID is available through:

`PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX`

A legacy `PUBLIC_GA_ID` value is accepted as a compatibility fallback by the component, but the documented production variable is `PUBLIC_GA4_MEASUREMENT_ID`.

If no valid ID is configured, the site does not load the Google tag. Instrumentation remains installed and exposes `data-ga4-status="not-configured"` for verification.

## Production verification

Run:

`npm run verify:g1-production`

Possible verdicts:

- `WAIT_FOR_DEPLOY_OR_RECRAWL` — fingerprint has not reached production.
- `NO_GO` — G1 instrumentation/CTA markers are missing or inconsistent.
- `PASS_WITH_CONFIGURATION_REQUIRED` — G1 code is live but no valid production GA4 Measurement ID is active.
- `PASS` — G1 code is live and the GA4 loader is active.

## Privacy disclosure

`/privacy-policy` now describes website analytics, contact-button measurement, device/page attribution and the fact that the site instrumentation does not intentionally send customer contact details or chat content as event parameters.

## Measurement interpretation

`line_click` and `phone_click` are contact-intent events. They must not be treated as confirmed qualified leads or completed purchases. Qualified-lead and sale attribution require a later CRM/order reconciliation layer.

## W5 interaction

The W5 GSC baseline remains frozen at finalized date 2026-09-06:

- 619 clicks
- 9,111 impressions
- CTR 6.79%
- average position 7.72

G1 is installed before the W5 observation clock starts. W5 source ownership is refreshed to W4+G0+G1 without resetting the GSC baseline. Missing GA4 configuration alone does not make the W5 SEO production gate NO_GO.

## Current implementation status

`CODE_READY / GA4_CONFIGURATION_REQUIRED / PRODUCTION_UNVERIFIED / W5_OBSERVATION_INACTIVE`
