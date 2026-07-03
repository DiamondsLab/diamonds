# Changelog — M1-E1 Confirm Unused + Enumerate

## 2026-07-03 — GO: all 26 advisories clear on removing unused axios + lodash (read-only)

- **Confirmed unused (widened):** `axios` + `lodash` = 0 usages across src/scripts/test, 0 in configs, not re-exported (`src/index` / `package.json` exports). `yarn why` shows `@diamondslab/diamonds` as the **sole direct dependent** of each.
- **Enumerated 26 advisories** → all are on **`axios` (23)** or **`lodash` (3)** themselves, all **direct** (dependent = diamonds), **0 transitive**. Recorded the table + verdict in [`baseline.md`](../../baseline.md) (M1 section).
- **✅ GO / clears-on-removal = ALL 26.** Removing both from `dependencies` should take the audit gate to 0. **No residual transitive work expected** → M1-E3 owner gate **OP-M1-1 will not fire** (barring a re-audit surprise).
- Read-only: only `baseline.md` (+ epic docs) changed; no source/dep/config touched.
