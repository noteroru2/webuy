# WEBUY W5 — Production Verification + GSC Observation Gate

Date: 2026-09-09 (Asia/Bangkok)
Behavior source through: W4 (`a54c608419acb13b369ecc18b7d1b9c553977c41`)
Latest finalized GSC baseline: 2026-09-06

## Initial verdict

`WAIT_FOR_DEPLOY_OR_RECRAWL`

W5 does not add ranking changes. It installs a production fingerprint, technical verifier, immutable GSC baseline and observation decision gate.

## Production PASS requirements

- `/webuy-recovery-gate.json` matches W4 source SHA.
- robots.txt does not block the site.
- Maha Sarakham winner is indexable/200, has one H1, W1 marker, Service + Breadcrumb schema, and no FAQPage/HowTo/Article/AggregateRating schema or hard-coded `128+ รีวิว` claim.
- Uthai Thani carries the W2 CTR marker and description.
- Phrae carries the combined W1/W2 marker.
- protected Udon printer service remains available and has no FAQPage/AggregateRating markup.
- notebook category remains available and has no FAQPage markup.
- sitemap is accessible.

## Observation clock

The clock is INACTIVE until `verify:w5-production` returns PASS against the live site. After PASS, production state must record the pass date. The first GSC review requires 7 finalized days after that production pass date; the primary decision window is 14 finalized days.

## Frozen baseline

Sitewide current 28d: 619 clicks / 9,111 impressions / CTR 6.79% / avg position 7.72.
Previous 28d: 387 / 6,103 / CTR 6.34% / avg position 7.96.

Protected W1 baselines and W2 CTR/query-mix baselines are stored in `observations/webuy-w5-baseline.json`.

## Freeze policy

Do not start another major WEBUY SEO batch during the first 7 finalized post-production days unless the production verifier is NO_GO or a confirmed technical defect appears.
