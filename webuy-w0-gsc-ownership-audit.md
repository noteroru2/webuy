# WEBUY W0 — GSC Winner + Local Query Ownership Audit

Date: 2026-09-09 (Asia/Bangkok)
Property: https://webuy.in.th/
Source baseline: main @ 54edddbfcbcf1447ce9f3c2c84a3c608d2e6844b
Latest finalized GSC date: 2026-09-06

## Verdict

`AUDIT_PASS / BASELINE_FROZEN / PRODUCTION_UNCHANGED`

W0 is audit-only. No public page, title, H1, canonical, redirect, schema, robots, sitemap, template, or generated WordPress data is changed by this batch.

## 28-day GSC comparison

| Period | Clicks | Impressions | CTR | Avg position |
|---|---:|---:|---:|---:|
| 2026-07-13 → 2026-08-09 | 387 | 6,103 | 6.34% | 7.96 |
| 2026-08-10 → 2026-09-06 | 619 | 9,111 | 6.79% | 7.72 |

Change:
- clicks +59.9%
- impressions +49.3%
- CTR improved from 6.34% to 6.79%
- average position improved by ~0.24

The site is growing on an unchanged production content base. The latest main source change is dated 2026-05-18, so the current growth is primarily a search visibility/re-ranking effect rather than a fresh September deployment.

## Ownership model

### DISTRIBUTED_LOCAL_OWNERSHIP — protect

Generic near-me queries are not owned by one generic hub. Google distributes them across `/locations/{province}/` pages according to searcher geography. This is working and must not be consolidated into one homepage/category URL.

Examples, current 28d:
- `รับซื้อโน๊ตบุ๊ค ใกล้ฉัน`: Yasothon 2 clicks / 10 impressions / pos 2.60; Chumphon 1 / 4 / pos 2.00; several other province pages also rank in positions ~2–5.
- `ร้านรับซื้อคอมพิวเตอร์ ใกล้ฉัน`: Maha Sarakham 1 / 12 / pos 2.08; Bueng Kan 1 / 2 / pos 4.50; other local pages and a small number of exact local-service pages also appear.
- `ร้านรับซื้อโทรศัพท์ใกล้ฉัน`: Yasothon 1 / 30 / pos 4.97; Narathiwat 1 / 7 / pos 9.29; other province pages receive smaller impressions.

Decision: `NO_GENERIC_NEAR_ME_CONSOLIDATION`.

### Location-page winners — PROTECT

| Page | Current clicks/imp/pos | Previous clicks/imp/pos | Decision |
|---|---|---|---|
| `/locations/maha-sarakham/` | 49 / 705 / 6.20 | 31 / 575 / 6.04 | PROTECT + TOP-3/5 PUSH |
| `/locations/yasothon/` | 31 / 444 / 5.59 | 20 / 319 / 6.25 | PROTECT + TOP-3/5 PUSH |
| `/locations/phichit/` | 27 / 228 / 6.50 | 10 / 75 / 5.71 | PROTECT; query surface expanding |
| `/locations/yala/` | 21 / 350 / 6.63 | 19 / 283 / 7.18 | PROTECT + PUSH |
| `/locations/nakhon-si-thammarat/` | 20 / 310 / 6.75 | 5 / 112 / 6.28 | PROTECT; strong visibility expansion |
| `/locations/ang-thong/` | 18 / 153 / 5.24 | 7 / 66 / 8.64 | PROTECT |
| `/locations/lamphun/` | 18 / 225 / 6.65 | 12 / 223 / 6.70 | PROTECT |
| `/locations/narathiwat/` | 17 / 219 / 6.86 | 10 / 159 / 7.14 | PROTECT + PUSH |
| `/locations/phatthalung/` | 16 / 154 / 6.63 | 6 / 62 / 7.03 | PROTECT |
| `/locations/surin/` | 16 / 260 / 6.31 | 5 / 31 / 5.29 | PROTECT; large query expansion |
| `/locations/pattani/` | 15 / 201 / 6.75 | 12 / 168 / 6.82 | PROTECT |

Do not rewrite titles/H1/content broadly on these pages before a page-level query review.

### PUSH / CTR opportunity

- `/locations/phrae/`: 20 / 384 / pos 7.23 vs 17 / 210 / 6.92. Visibility expanded ~83%, but CTR fell 8.10% → 5.21%. Treat as `PUSH_CTR`, not recovery.
- `/locations/uthithani/`: 14 / 218 / 6.32 vs 14 / 129 / 6.30. Impressions +69% with flat clicks; `PUSH_CTR`.
- `/locations/nonthaburi/`: 13 / 238 / 8.82 vs 3 / 74 / 8.08. Strong visibility/click expansion; `PUSH_PAGE1` with winner-safe changes only.
- `/locations/lei/`: 6 / 142 / 7.70 vs 6 / 39 / 5.44. Impressions expanded sharply while clicks stayed flat; `QUERY_MIX_VERIFY + CTR_PUSH`.
- `/locations/sukhothai/`: 1 / 65 / 6.69 vs 1 / 22 / 5.64. `CTR/QUERY_MIX_VERIFY`.

### RECOVER_VERIFY — do not rewrite yet

- `/locations/chonburi/`: 5 / 121 / pos 12.69 vs 4 / 39 / 8.87. Visibility expanded but average rank moved to page 2. Needs Query×Page review before recovery edits.
- `/locations/nakonpanom/`: 2 / 20 / 10.10 vs 1 / 33 / 7.88. Small signal; verify before action.
- `/locations/samut-sakhon/`: 0 / 28 / 7.39 vs 2 / 23 / 5.65. Small signal; verify before action.

Nan is NOT a ranking-recovery candidate at this stage: `/locations/nan/` fell 32 → 20 clicks and 382 → 303 impressions, but position improved 7.17 → 6.20. Classify `HOLD_CTR_DEMAND`, not ranking loss.

## Service-page winners — protect

Existing local-service pages with meaningful search signal should not be folded into province pages without query evidence, including:
- `/services/sell-used-printer-udonthani/` — 8 clicks / 45 impressions / pos 4.07
- `/services/buy-used-computer-chanthaburi/` — 9 / 111 / 6.21
- `/services/sell-used-printers-nakhonratchasima/` — 6 / 35 / 4.06
- `/services/sell-used-computer-ratchaburi/` — 5 / 76 / 5.83
- `/services/sell-used-monitor-phuket` — 5 / 21 / 5.43

These pages represent specific service+location intent. `CONSOLIDATE` requires Query×Page overlap with a clearly stronger exact owner; W0 finds no sitewide evidence justifying broad redirects.

## Category hubs — HOLD / ownership review

- `/categories/notebook/`: 1 / 71 / pos 23.85 vs 1 / 59 / 18.66
- `/categories/computer/`: 0 / 80 / pos 40.69 vs 0 / 51 / 21.96
- `/categories/smartwatch/`: 0 / 38 / pos 26.26 vs 2 / 46 / 29.63

These are not current local traffic winners. Do not strengthen or consolidate them until their intended query ownership is audited against service pages and location pages.

## Source architecture findings

- Production content is committed under `src/generated/wp-data/`; build no longer fetches WordPress live.
- Historical commit metadata records ~3,127 services and 77 locations in the committed content surface.
- `/locations/[province]` is generated from all published WEBUY location slugs and uses a shared location model with related services, related prices and internal-link injection.
- The large service surface is therefore intentional legacy architecture. Because sitewide clicks and impressions are currently rising strongly, W0 does **not** authorize mass noindex/GONE/redirect work.

### Technical warning for a later batch

The location model currently emits a large structured-data stack (LocalBusiness + Article + HowTo + Service + FAQ when available), and the LocalBusiness call enables a fixed aggregate rating value/review count. This is not changed in W0 because the current location family is the strongest traffic surface. Audit template/schema intent separately after winner-safe ranking work.

## Lifecycle / decision classes

- `PROTECT`: current winners; no broad rewrite.
- `PUSH`: positions ~4–10 with meaningful impressions and correct ownership.
- `PUSH_CTR`: impressions expanded faster than clicks while ranking remains healthy.
- `RECOVER_VERIFY`: potential rank loss requiring Query×Page proof before edits.
- `HOLD`: low-value/unclear ownership; no action.
- `CONSOLIDATE`: none proven at W0 sitewide level.

## Recommended sequence

1. **WEBUY W1 — Local Winner Top-3/5 Push**: Maha Sarakham, Yasothon, Yala, Nakhon Si Thammarat, Phrae, Nonthaburi; minimal page-specific changes and no generic template rewrite.
2. **WEBUY W2 — CTR / Query-Mix Optimization**: Uthai Thani, Phrae, Loei, Sukhothai and selected high-impression page-1 pages.
3. **WEBUY W3 — Page-One Recovery Verification**: Chonburi first; then Nakhon Phanom / Samut Sakhon only if query-level evidence is sufficient.
4. **WEBUY W4 — Service/Category Ownership + Template/Schema Hygiene**: protect service winners, resolve only proven overlap, audit the structured-data stack. No mass 3,000-page cleanup without GSC evidence.
5. **WEBUY W5 — Production Verification + GSC Observation Gate**.

## Guardrails

- Do not consolidate generic `ใกล้ฉัน` intent into one URL.
- Do not bulk rewrite location titles/H1s.
- Do not mass noindex service pages while the site is gaining visibility.
- Protect pages showing strong click/impression growth even when average position slightly worsens due query expansion.
- Separate CTR/demand decline from ranking decline before recovery edits.
