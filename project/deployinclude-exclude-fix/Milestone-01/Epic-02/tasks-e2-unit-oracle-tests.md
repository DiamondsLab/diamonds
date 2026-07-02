# Tasks — M1-E2 Unit Oracle Tests

Execution checklist for [prd-e2-unit-oracle-tests.md](prd-e2-unit-oracle-tests.md). Driven by
`/df3ndr:process-task-list`. **Tests-only** epic against the pure `src/resolution/` core (M1-E1). It
deliberately lands the project's **first intentional REDs** (additivity + upgrade probe) — per the plan
§6 carve-out, M1 ends RED; M2 greens additivity, M3 greens the upgrade path.

## Relevant Files & Resources

- `…/Milestone-01/Epic-02/prd-e2-unit-oracle-tests.md` — the Change Plan this list executes.
- `…/Milestone-01/Epic-02/overview/e2-unit-oracle-tests.md` — the epic overview.
- `…/deployinclude-exclude-fix-architecture.md` — the **frozen** oracle (§4 truth table; selectors `0xdc38f9ab` / `0x7f0c610c`).
- `…/Milestone-00/test-audit-matrix.md` — the "add" list this epic fulfils (additivity, upgrade-path).
- **Under test (read-only):** `packages/diamonds/src/resolution/selectorResolution.ts` (`computeFacetSelectors`, `resolveFunctionSelectorRegistry`).
- **Create:** `packages/diamonds/test/unit/selectorResolution.test.ts` — the table-driven unit suite (auto-picked by `test:unit`).
- **Create/append:** `…/Milestone-01/Epic-02/CHANGELOG.md`.
- Memory `deployinclude-exclude-fix-project` — update on completion.

### Notes

- **Runner:** reuse `yarn test:unit` (hardhat+mocha+chai); import the core from `../../src/resolution`.
  No deploy, no provider — constructed inputs only.
- **Intentional REDs are the deliverable.** `yarn test:unit` WILL end with the additivity test failing
  (and possibly the upgrade probe). Annotate each RED with a `TODO(M2)` / `TODO(M3)`; the CHANGELOG must
  list exactly which failures are intentional so they're never read as a regression.
- **Don't assume the upgrade probe is RED — run it and record the real result** (the mistake that
  derailed the original premise). If it passes, document that the `5b2f7af` path already handles it.
- **Assert the stable contract** (selector → owning facet + address + action), not internal registry fields.
- **Commit needs `--no-verify`** (owner-approved): the submodule pre-commit hook fails on pre-existing
  warnings. Same branch as M1-E1 (`feature/resolution-seam`); `dist/` gitignored (tests aren't built).
- No secrets / privileges / production — no STOP-and-approve steps.

## Tasks

- [x] 0.0 Prepare & safeguard
  - [x] 0.1 On `feature/resolution-seam`; seam committed (`662a09c`). chai `^4.2.0` available; conventions = `import { expect } from 'chai'`, import from `../../src/...`.
  - [x] 0.2 Baseline: submodule unit suite green (70 pass / 7 pending / 0 fail). New REDs are intentional additions.
  - [x] 0.3 No backup needed (additive test file).
- [x] 1.0 Scaffold the table-driven harness
  - [x] 1.1 Created `test/unit/selectorResolution.test.ts` importing the core from `../../src/resolution`.
  - [x] 1.2 Added `makeFacet` factory + `deployAndResolve` compose helper (mirrors the strategy: `computeFacetSelectors` per facet → `resolveFunctionSelectorRegistry`).
  - [x] 1.3 Ownership read directly off the registry Map (`reg.get(sel) → {facetName, address, action}`).
- [x] 2.0 Green guards (regression — all PASS)
  - [x] 2.1 `computeFacetSelectors` exclude-only → green.
  - [x] 2.2 Fixture A → `0xdc38f9ab` absent, `0x7f0c610c`→Exclude (INV-1/6) → green.
  - [x] 2.3 Fixture B → `0x7f0c610c`→Include (override), `0xdc38f9ab`→Exclude (INV-2) → green.
  - [x] 2.4 INV-9 non-existent signature no-op → green.
- [x] 3.0 RED targets (the deliverable)
  - [x] 3.1 **Additivity (INV-3) → RED** as designed: `computeFacetSelectors([SEL_INCLUDE,SEL_EXCLUDE],['testDeployInclude()'],[])` returns `[0x7f0c610c]`; test wants both. `AssertionError: expected [ '0x7f0c610c' ] to have the same members as [ '0x7f0c610c', '0xdc38f9ab' ]`. TODO(M2).
  - [x] 3.2 **Upgrade probe → GREEN (recorded, not assumed).** Same-facet redeploy (Deployed@X → @Y) resolves to **Replace @ Y** correctly. The basic upgrade Replace path works; M3 should probe more adversarial include-override-on-upgrade (5b2f7af) scenarios. TODO(M3) reframed: explore, not necessarily fix.
- [x] 4.0 Validate
  - [x] 4.1 New file runs **chain-free** in 74ms (no deploy/provider).
  - [x] 4.2 Green: exclude-only, Fixture A, Fixture B, INV-9 — all pass.
  - [x] 4.3 Additivity **RED** (expected, message confirmed); upgrade probe **GREEN** (recorded).
  - [x] 4.4 Full `yarn test:unit` → **46 passing / 1 failing**; the **only** failure is the additivity RED. No unintended regression (all pre-existing unit tests pass).
- [x] 5.0 Record + commit
  - [x] 5.1 `CHANGELOG.md` written: 6 green + 1 intentional RED (additivity→M2); upgrade probe **GREEN** finding recorded.
  - [x] 5.2 Committed `3bf37f6` on `feature/resolution-seam` with `--no-verify`.
  - [x] 5.3 Memory updated: M1-E2 done; **upgrade probe GREEN → M3 scope narrowed** to adversarial cases.
  - [x] 5.4 Handoff: M2 greens the additivity RED; M3 probes adversarial upgrade scenarios (basic redeploy already green).

> ✅ **M1-E2 COMPLETE (2026-06-29).** First genuine RED pinned (INV-3 additivity → M2). Upgrade probe GREEN
> (basic redeploy Replace works). Committed `3bf37f6` (`--no-verify`). Planning docs uncommitted.
