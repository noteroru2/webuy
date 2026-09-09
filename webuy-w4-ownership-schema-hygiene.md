# WEBUY W4 — Service/Category Ownership + Template/Schema Hygiene

Date: 2026-09-09 (Asia/Bangkok)
Parent: W3

## Verdict

`OWNERSHIP_HOLD / SCHEMA_HYGIENE_APPLIED / WINNERS_PRESERVED`

## Ownership

W0/W3 did not prove a broad service-vs-category-vs-location duplicate owner that justifies mass redirects. Specific service+location winners remain protected. Category hubs remain HOLD until they earn query ownership.

No service/category/location consolidation is performed in W4.

## Structured-data cleanup

### Location pages
Keep:
- BreadcrumbList
- Service with areaServed

Stop emitting from the location template:
- FAQPage structured data
- HowTo structured data
- Article structured data on service-location pages
- per-location LocalBusiness/rating markup

Visible FAQ content remains.

### Service pages
Keep visible FAQ content and BreadcrumbList. Stop emitting:
- FAQPage structured data
- hard-coded Product/AggregateRating review markup

### Category pages
Keep visible FAQ content and BreadcrumbList. Stop emitting FAQPage markup.

## Review/rating hygiene

The visible location KPI previously displayed a fixed `4.9 (128+ รีวิว)` value. W4 removes that hard-coded claim and replaces it with a factual action cue (`ส่งรูป + รุ่น/สเปก`).

Any future rating/review markup must be backed by genuine, visible review data rather than constants.

## Rationale

Google removed FAQ rich results from Search in May 2026, and HowTo rich results are no longer shown. Google's review-snippet guidelines also state that LocalBusiness/Organization self-serving review markup is not eligible for the star review feature and ratings must be sourced from users.

## Guardrails
- No generated WordPress content rewrite.
- No location title/H1 changes.
- No route/canonical/redirect changes.
- No mass noindex/GONE action.
- Preserve W1/W2 location optimization overrides.
