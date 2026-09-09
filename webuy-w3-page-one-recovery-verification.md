# WEBUY W3 — Page-One Recovery Verification

Date: 2026-09-09 (Asia/Bangkok)
Parent: W2

## Verdict

`VERIFY_PASS / NO_REWRITE / NO_SOURCE_BEHAVIOR_CHANGE`

W3 verifies suspected recovery candidates before changing them.

## Chonburi

Page-level 28d moved from 4 clicks / 39 impressions / avg pos 8.87 to 5 clicks / 121 impressions / avg pos 12.69.

Query-level evidence shows the weaker average is driven by new query mix, not a uniform collapse. Current examples include:
- `รับซื้อ macbook ใกล้ฉัน` — pos 8
- `รับซื้ออุปกรณ์ไอที ใกล้ฉัน` — pos 6
- `ร้านรับซื้อแท็บเล็ต` — pos 3
- `ร้านรับซื้อโน๊ตบุ๊ค ใกล้ฉัน` variant — pos ~4–5
- broader generic notebook/computer variants also appeared around positions 31–45, pulling the page average down.

Decision: `QUERY_MIX_EXPANSION / HOLD_NO_REWRITE`.

## Nakhon Phanom

Page-level signal is very small: 2 clicks / 20 impressions / avg pos 10.10 vs 1 / 33 / 7.88. Query-level rows are not returned at useful volume in the current Search Console extract.

Decision: `LOW_DATA_HOLD`.

## Samut Sakhon

Page-level signal is also small: 0 clicks / 28 impressions / avg pos 7.39 vs 2 / 23 / 5.65.

Decision: `LOW_DATA_HOLD`.

## Guardrails
- Do not rewrite these location pages in W3.
- Do not infer ranking loss from blended average position alone.
- Re-check after W1/W2 production observation if impressions materially increase.
