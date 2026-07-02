# Changelog — M2-E2 Test Correction

## 2026-06-29 — Vacuous B4 assertion rewritten (INV-6, direct)

- `test/deployment/DeployIncludeExclude.test.ts` — rewrote the B4 test (was `…registry shows
  testDeployExclude() has no facet assignment`, which asserted nothing because its
  `if (registry.has('0xdc38f9ab'))` guard is false). Now it asserts **INV-6 absence directly and
  unconditionally**: `expect(await exampleDiamond.facetAddress('0xdc38f9ab')).to.equal(ZeroAddress)` — under
  the exclude config no facet owns the excluded selector.
- `SelectorRegistration.test.ts` — reviewed; **no change** (its tests are pure selector-calc / config-parse,
  already non-vacuous).
- **Verified:** `DeployIncludeExclude` → 17/17 (B4 now passes non-vacuously); full root `yarn test` →
  **191 / 69 / 0**.
- **Git:** root test left **uncommitted** (per convention).

**M2 (Additivity & Test Correctness) COMPLETE:** E1 (additivity fix + the hardhat-diamonds wiring fix) ·
E2 (B4 rewrite). Both additivity REDs green; the suite asserts the design directly.
