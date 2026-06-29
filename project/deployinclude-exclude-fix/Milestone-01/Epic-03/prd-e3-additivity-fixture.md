# Change Plan (PRD) — M1-E3 Additivity Fixture

> **Epic overview:** [e3-additivity-fixture.md](overview/e3-additivity-fixture.md) · **Parent milestone:** [Milestone 2 (M1)](../overview/milestone-02-testable-resolution-core.md) · **Project plan:** [project-plan](../../deployinclude-exclude-fix-project-plan.md) · **Oracle:** [architecture §4.3](../../deployinclude-exclude-fix-architecture.md) (Fixture C, DR-5)
> **Status:** 📋 ready for `/generate-tasks` · **Owner:** Engineer (agent-assisted) · **Date:** 2026-06-29

## 1. Overview & Problem
The M1-E2 unit RED proves additivity (INV-3) is broken at the function level. This epic adds the **on-chain**
counterpart — a config where the including facet also owns a selector **no higher-priority facet claims**,
so the whitelist behavior is visible end-to-end. **Goal:** add `examplediamond-include-additive.config.json`
+ a focused integration test asserting the including facet owns **both** its selectors — authored as
**pending/skip** so the root suite stays green (189/69/0); M2 un-skips and greens it.

**Owner decisions (2026-06-29):** authored as **`it.skip`/pending** (TODO(M2)); lives in a **new
`test/deployment/DeployAdditive.test.ts`**.

## 2. Goals
- A committed root config `diamonds/ExampleDiamond/examplediamond-include-additive.config.json` that deploys
  a valid diamond with `ExampleTestDeployInclude` @60 (`deployInclude:["testDeployInclude()"]`) and **no**
  `ExampleTestDeployExclude`.
- A new `test/deployment/DeployAdditive.test.ts` asserting `ExampleTestDeployInclude` owns **both**
  `0x7f0c610c` **and** `0xdc38f9ab` (via DiamondLoupe).
- The test is **pending/skip** in normal runs (root `yarn test` stays 189/69/0), but **verified to be a
  genuine RED at HEAD** via a one-time un-skip check (then re-skip).
- **No new Solidity** — reuse the existing `ExampleTestDeployInclude` contract (exposes both selectors).

## 3. Scope — Components & Services
- **New (dev-env root):** `diamonds/ExampleDiamond/examplediamond-include-additive.config.json`.
- **New (dev-env root):** `test/deployment/DeployAdditive.test.ts` (deploys via `LocalDiamondDeployer`,
  asserts via `DiamondLoupe.facetAddress` / `facetFunctionSelectors`).
- **Reused (read-only):** `contracts/examplediamond/ExampleTestDeployInclude.sol` (both selectors), the
  core facets (DiamondCut, Loupe, Ownership, `ExampleInitFacet`).
- **Runtime:** local in-process Hardhat network (only during the one-time un-skip verification; the
  committed test is skipped).

## 4. Stakeholders & Impact
- **Affected:** M2 (un-skips + greens this), M4 regression.
- **User-facing / production impact:** **none** — a test fixture + a skipped test; root suite unchanged (green).

## 5. Operational Requirements
1. The config MUST be the include config **minus `ExampleTestDeployExclude`**, keeping the core facets +
   `ExampleTestDeployInclude` @60 with `deployInclude:["testDeployInclude()"]`. It MUST parse and deploy a
   valid diamond.
2. The test MUST assert `ExampleTestDeployInclude` owns **both** `0x7f0c610c` and `0xdc38f9ab` —
   `facetAddress(0xdc38f9ab)` MUST equal the `ExampleTestDeployInclude` address (the additive expectation).
3. The test MUST be committed as **`it.skip`/pending** with a `TODO(M2)` so it does **not** run in normal
   `yarn test` (root stays **189/69/0**).
4. **Genuine-RED verification (one-time):** during execution, temporarily un-skip and run it; **confirm it
   FAILS at HEAD** (the facet owns only `0x7f0c610c`; `0xdc38f9ab` is absent), record the failure, then
   **re-skip**. This proves it is a real RED, not a false/no-op pending test.
5. After re-skip, the full root `yarn test` MUST still be **189/69/0** (no net change to the green suite).
6. **No** change to `src/resolution/`, `BaseDeploymentStrategy`, or contracts (M2 does the fix).

## 6. Security & Compliance Considerations
- **None.** A JSON fixture + a skipped integration test; local Hardhat only, no secrets/provider/production.
  **No human-approval gate** applies. (Deployment records the test may write are gitignored / cleaned up.)

## 7. Non-Goals (Out of Scope)
- **Fixing** additivity (the whitelist removal) → M2.
- **New Solidity** — reuses `ExampleTestDeployInclude`.
- An **active-RED** test — rejected; pending/skip keeps root green.
- Submodule changes — this epic is entirely dev-env-root.

## 8. Risk, Rollback & Recovery
- **Risk:** a skipped test silently would-pass (false RED). **Mitigation:** the one-time un-skip
  verification (req. 4) proves it's RED at HEAD before re-skipping.
- **Risk:** the additive config fails to deploy (missing a core facet). **Mitigation:** copy the working
  include config and only **remove** `ExampleTestDeployExclude`; verify deploy during the un-skip check.
- **Rollback:** delete the two new files. **No backup required** (additive, no production surface).

## 9. Validation / Success Metrics
- `examplediamond-include-additive.config.json` parses and (during the un-skip check) deploys a valid diamond.
- The un-skip run shows the additivity assertion **FAILING** at HEAD (recorded in the epic CHANGELOG).
- With the test re-skipped, root `yarn test` = **189 passing / 69 pending+1 / 0 failing** (the skipped test
  adds to pending, not failing).
- M2 has a ready, verified RED to un-skip and green.

## 10. Open Questions
- Whether to also assert via `funcSelectors` length (== 2 after the fix) in addition to `facetAddress`
  ownership — cheap; likely include both for a stronger assertion. (Decide in `/generate-tasks`.)
- Exact deployment-record cleanup in the test's `after()` (mirror `DeployIncludeExclude.test.ts`'s
  pattern). 
