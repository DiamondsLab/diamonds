# Change Plan (PRD) — M1-E1 Resolution Seam

> **Epic overview:** [e1-resolution-seam.md](overview/e1-resolution-seam.md) · **Parent milestone:** [Milestone 2 (M1)](../overview/milestone-02-testable-resolution-core.md) · **Project plan:** [project-plan](../../deployinclude-exclude-fix-project-plan.md) · **Oracle:** [architecture](../../deployinclude-exclude-fix-architecture.md) (frozen) · **Audit:** [test-audit-matrix](../../Milestone-00/test-audit-matrix.md)
> **Status:** 📋 ready for `/generate-tasks` · **Owner:** Engineer (agent-assisted) · **Date:** 2026-06-28

## 1. Overview & Problem
The selector-resolution logic is entangled inside `BaseDeploymentStrategy` and only reachable by
deploying a diamond on a Hardhat node — too slow and too coupled to drive TDD. **Goal:** extract it into a
**pure, chain-free module** so it can be unit-tested in milliseconds (M1-E2) and later promoted into the
`basestrategy-fulfillment` shared core — **with zero behavior change** (the green baseline stays green).

**Owner decisions (2026-06-28):** module home = **neutral `src/resolution/`**; extract **both** the
registry resolution **and** the deploy-time include/exclude filter; **strict** behavior-preservation
(keep the dead `higherPrioritySplit`, the `5b2f7af` branch, and the whitelist **verbatim** — all fixes
are M2/M3).

## 2. Goals
- A pure module under `packages/diamonds/src/resolution/` that, given facet configs + ABIs + prior
  deployed state, returns the **ownership map + cut actions** — **no Hardhat/provider dependency**.
- `BaseDeploymentStrategy` reduced to a **thin caller** at both lifecycle points (deploy-time filter +
  post-deploy registry resolution).
- **Zero behavior change:** full root `yarn test` and submodule `yarn test` green, identical to the M0 baseline.
- A `priorDeployedState` input shaped now so M3's upgrade fix needs **no signature change**.
- Export shaped for reuse by the planned validator (no dev-env coupling).

## 3. Scope — Components & Services
- **New (submodule):** `packages/diamonds/src/resolution/` — e.g. `selectorResolution.ts` (+ a small
  barrel/index if useful). Dependency-light: `ethers` (`id` for selector math) only — **no** `hardhat`,
  no provider, no `Diamond`/`hre`.
- **Edited (submodule):** `packages/diamonds/src/strategies/BaseDeploymentStrategy.ts` — the deploy-time
  include/exclude filter ([:223-238](../../src/strategies/BaseDeploymentStrategy.ts#L223-L238)) and the
  registry resolution ([:314-497](../../src/strategies/BaseDeploymentStrategy.ts#L314-L497)) now delegate
  to the module.
- **In play (unchanged behavior):** RPC/Local strategies (inherit `BaseDeploymentStrategy`).
- **Runtime:** none changed — library refactor only.

## 4. Stakeholders & Impact
- **Affected:** internal — `@diamondslab/diamonds` consumers via the strategy (behavior identical).
- **User-facing / production impact:** **none.** No deployed contract, published release, or CI gate
  changes; this is a pure internal refactor.
- **Downstream maintainers:** M1-E2 (unit-tests the module), M2 (makes it additive), M3 (fixes upgrade +
  removes dead code) all build on this seam.

## 5. Operational Requirements
1. Create `packages/diamonds/src/resolution/` exporting **pure** functions covering **both**:
   (a) candidate-set computation — apply `deployExclude` and the current `deployInclude` **whitelist**
   exactly as today; (b) ownership/cut resolution — the body of `updateFunctionSelectorRegistryTasks`.
2. The module MUST take **no** Hardhat/provider import; selector math via `ethers.id` only.
3. The resolution API MUST accept a **`priorDeployedState`** parameter (the currently-deployed
   selector→facet/address mirror) so the upgrade path has a stable home — even though upgrade **logic is
   unchanged** in this epic.
4. `BaseDeploymentStrategy` MUST delegate to the module at **both** call sites; **no** resolution logic
   remains inlined in the strategy.
5. The relocation MUST be **verbatim** — the dead `higherPrioritySplit` (`entry.priority > priority`), the
   `5b2f7af` `Replace` branch, and the deploy-time whitelist are preserved **unchanged**. **No fixes.**
6. The module MUST have **no dev-env coupling** (importable by the `basestrategy-fulfillment` validator as-is).
7. **Behavior parity MUST be proven:** full root `yarn test` + submodule `yarn test` green, with no
   behavioral diff vs the M0 baseline.

## 6. Security & Compliance Considerations
- **None.** Pure TypeScript refactor of a library module — no secrets, credentials, keys, network,
  provider, or production resources. No elevated privileges; **no human-approval gate** applies.

## 7. Non-Goals (Out of Scope)
- **Removing the whitelist / making `deployInclude` additive** → M2.
- **Removing the dead `higherPrioritySplit`** or reconciling `5b2f7af` → M3.
- **Fixing the upgrade/redeploy path** → M3 (only the *input shape* is designed here).
- Writing the unit tests → M1-E2. Building Fixture C → M1-E3.
- Any config-schema change (INV-5); OZDefender; RPC/Local code changes beyond inherited delegation.

## 8. Risk, Rollback & Recovery
- **Risk:** silent behavior drift during extraction. **Mitigation:** move logic **mechanically**; run
  full + submodule suites before and after and require identical results against the M0 baseline.
- **Risk:** two lifecycle call sites (pre-deploy filter vs post-deploy registry) make a single function
  awkward. **Mitigation:** expose a **candidate-set** helper (pre-deploy) + a **resolve** function
  (post-deploy) — both pure — rather than forcing one entry point.
- **Risk:** `priorDeployedState` shape proves wrong in M3. **Mitigation:** validate the shape against
  M1-E2's upgrade probe before closing M1.
- **Rollback:** revert the single seam commit — restores the inlined logic with **no** behavior change
  either way. **No backup/snapshot required** (version-controlled library code, no production state).

## 9. Validation / Success Metrics
- `grep` confirms the new module imports **no** `hardhat`/provider (only `ethers`).
- Full root `yarn test` → same pass/pending/fail counts as the M0 baseline (189 / 69 / 0).
- Submodule `yarn test` (and `yarn test:unit`) green.
- Spot-check: for Fixtures A & B, the module's `ownership`/`cuts` output equals the pre-refactor
  registry state (the integration suite's A/B assertions still pass — the proxy for parity).
- `BaseDeploymentStrategy` no longer contains inlined resolution logic (it delegates).

## 10. Open Questions
- Exact sub-API shape — one `resolve()` vs `computeCandidates()` + `resolve()` helpers? (Lean: two pure
  helpers, decided in `/generate-tasks`.)
- Whether to add a barrel `src/resolution/index.ts` now or when the validator consumes it. (Default: add
  it now for a clean import surface.)
- Naming of the `priorDeployedState` type — align with the existing `DeployedDiamondData.DeployedFacets`
  shape to minimize adapter code.
