# Changelog — M1-E3 Residual + Verify

## 2026-07-03 — M1 verified + CLOSED (verification-only; no residual)

- **Audit gate:** `yarn npm audit --severity moderate` → exit 0 (re-confirmed).
- **Build:** `npm run build` → exit 0 (green).
- **Tests:** `npm run test:unit` → **19 passing / 0 failing** — no regression.
- **Correction:** the M0 baseline's "51/0" was from the `feature/resolution-seam` branch (extra deployInclude tests, PR #12); on `main`-based branches `test:unit` = 19/0. Recorded in `baseline.md`.
- **No residual advisory** → owner gate **OP-M1-1 did not fire**; M1-E3 was verification-only.
- **✅ Milestone M1 DONE** — audit gate green (26 → 0), build + tests green, no source change. Only doc changes in this epic.
