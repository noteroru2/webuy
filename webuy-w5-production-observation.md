# WEBUY W5 — Production Verification + GSC Observation Gate

Date: 2026-09-09 (Asia/Bangkok)
Behavior source through: W4 + G0 (`33d8c18f6fef5e1694005ff10db0a160e531b888`)
Latest finalized GSC baseline: 2026-09-06

## Initial verdict

`WAIT_FOR_DEPLOY_OR_RECRAWL`

W5 installs a production fingerprint, technical verifier, immutable GSC baseline and observation decision gate. G0 trust/homepage hygiene was completed before the observation clock started, so the fingerprint now represents the final W1-W4 + G0 behavior source.

## Production PASS requirements

- `/webuy-recovery-gate.json` matches the W4+G0 source SHA.
- robots.txt does not block the site.
- homepage is available, has one H1, Organization + WebSite schema, OG metadata, no SearchAction, and none of the removed synthetic trust/review/5-minute claims.
- Maha Sarakham winner is 200, has one H1, W1 marker, Service + Breadcrumb schema, no FAQPage/HowTo/Article/AggregateRating schema, and no English district system label.
- Uthai Thani carries the W2 CTR marker and description.
- Phrae carries the combined W1/W2 marker.
- protected Udon printer service remains available and has no FAQPage/AggregateRating markup.
- notebook category remains available, has Breadcrumb markup, no FAQPage markup and no internal English heading leakage.
- sitemap is accessible.

## Observation clock

The clock is INACTIVE until `verify:w5-production` returns PASS against the live site. After PASS, production state must record the pass date. The first GSC review requires 7 finalized days after that production pass date; the primary decision window is 14 finalized days.

## Frozen baseline

Sitewide current 28d: 619 clicks / 9,111 impressions / CTR 6.79% / avg position 7.72.
Previous 28d: 387 / 6,103 / CTR 6.34% / avg position 7.96.

Protected W1 baselines and W2 CTR/query-mix baselines are stored in `observations/webuy-w5-baseline.json`.

## Freeze policy

Do not start another major WEBUY SEO or homepage batch during the first 7 finalized post-production days unless the production verifier is NO_GO or a confirmed technical defect appears.
