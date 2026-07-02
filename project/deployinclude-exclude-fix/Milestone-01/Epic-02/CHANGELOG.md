# Changelog — M1-E2 Unit Oracle Tests

## 2026-06-29 — Chain-free unit oracle suite added (first genuine RED)

- **New:** `packages/diamonds/test/unit/selectorResolution.test.ts` — 7 table-driven, chain-free cases
  against the pure core (74ms, no deploy). Composes `computeFacetSelectors` → `resolveFunctionSelectorRegistry`
  to mirror the strategy's real flow.
- **Green guards (6):** selector-constant sanity; `computeFacetSelectors` exclude-only; INV-9 (non-existent
  signature → no-op); **Fixture A** (exclude → `0xdc38f9ab` absent, `0x7f0c610c`→Exclude; INV-1/6);
  **Fixture B** (lower-priority `deployInclude` overrides higher; INV-2).
- **Intentional RED (1) — INV-3 additivity → M2:** `computeFacetSelectors([0x7f0c610c,0xdc38f9ab],['testDeployInclude()'],[])`
  returns `[0x7f0c610c]` (whitelist drops the other selector); the test asserts the additive `[both]`.
  `AssertionError: expected [ '0x7f0c610c' ] to have the same members as [ '0x7f0c610c', '0xdc38f9ab' ]`.
- **Upgrade-path probe → GREEN (measured, not assumed):** a same-facet redeploy (selector `Deployed`@X →
  facet @Y) resolves to **Replace @ Y** correctly. **Finding:** the basic upgrade Replace path is NOT
  broken — so M3 narrows to **probing more adversarial include-override-on-upgrade (`5b2f7af`) scenarios**
  rather than assuming the whole path is red.
- **Validation:** full `yarn test:unit` → **46 passing / 1 failing**; the only failure is the sanctioned
  additivity RED. No regression in pre-existing unit tests.
- **Git:** committed on `feature/resolution-seam` with **`--no-verify`** (submodule pre-commit hook fails on
  pre-existing warnings; owner-approved). Planning docs left uncommitted.
- **Handoff:** M2 greens the additivity RED (make `deployInclude` additive); M3 explores the adversarial
  upgrade scenarios the probe didn't cover.
