# Epic 1 — Resolution Seam (M1-E1)

> **Parent milestone:** [Milestone 2 — Testable Resolution Core (M1)](../../overview/milestone-02-testable-resolution-core.md)
> **Maps to:** [project plan](../../../deployinclude-exclude-fix-project-plan.md) → §5 M1 epic table, row M1-E1 · Oracle: [architecture](../../../deployinclude-exclude-fix-architecture.md) · Audit: [test-audit-matrix](../../../Milestone-00/test-audit-matrix.md)
> **Owner:** Engineer (agent-assisted) · **Impact / blast radius:** Touches the **live resolution path** (`BaseDeploymentStrategy`, inherited by RPC/Local) — but **behavior-preserving**, guarded by the green baseline. · **Estimated effort:** M · **Status:** 📋 planned

## 1. Objective

Extract the entangled selector-resolution logic out of `BaseDeploymentStrategy` into a **pure,
chain-free function** so it can be unit-tested in milliseconds (M1-E2) and later promoted into the
`basestrategy-fulfillment` shared core. This epic changes **structure, not behavior**: the green
baseline must stay green. It deliberately carries the current logic **as-is** — including the
deploy-time whitelist, the dead `higherPrioritySplit`, and the `5b2f7af` branch — because the *fixes*
for those land in M2/M3 against this now-testable seam.

## 2. Acceptance criteria

- [ ] A new pure module (e.g. `src/strategies/selectorResolution.ts`) exports a function resolving facet
      inputs → **ownership map + cut actions**, with **no** Hardhat/provider import (`ethers.id` for
      selector math is fine — it's pure).
- [ ] Inputs include **`priorDeployedState`** (the on-chain/record mirror of currently-deployed
      selectors→facet/address) so the **upgrade path** has a home — even though upgrade *logic* is
      unchanged here.
- [ ] `BaseDeploymentStrategy.updateFunctionSelectorRegistryTasks()` **and** the deploy-time
      include/exclude filter delegate to the pure module (single source of truth for include/exclude).
- [ ] **Behavior preserved:** full root `yarn test` green **and** submodule `yarn test` green — no
      diff vs the M0 baseline.
- [ ] The export has **no dev-env coupling**, so `basestrategy-fulfillment` can lift it unchanged (oracle §6).

## 3. Tasks

| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | Confirm `yarn test:unit` runs chain-free | Engineer | a trivial `test/unit/*.test.ts` runs via `yarn test:unit` with no deploy |
| 2 | Define the pure signature + types: `FacetResolutionInput[]`, `PriorDeployedState`, `ResolutionResult{ ownership, cuts }` | Engineer | types compile; signature reviewed for promotability |
| 3 | Relocate the registry-resolution logic (`updateFunctionSelectorRegistryTasks` body) into the pure fn **verbatim** (keep whitelist, `higherPrioritySplit`, `5b2f7af`) | Engineer | logic moved with no semantic change |
| 4 | Fold the deploy-time include/exclude filter (BaseDeploymentStrategy.ts:223-238) into a shared candidate-set helper used by the pure fn | Engineer | one source of truth for include/exclude |
| 5 | Wire `BaseDeploymentStrategy` to call the pure fn (thin caller) | Engineer | strategy delegates; no inlined resolution logic remains |
| 6 | Run full root + submodule suites; confirm green | Engineer | both green; behavior identical to baseline |

## 4. Dependencies & owner gates

- **Upstream:** M0 — the **frozen oracle** (the target the seam will later be made to satisfy). No code dep.
- **Owner gates:** **none.** The blocking gate was M0-E1 (cleared); this epic is fully engineer-executable.
- **Downstream:** M1-E2 (unit-tests the pure fn), M2 (makes it additive), M3 (fixes upgrade + removes dead code).

## 5. Risks

| Risk | Mitigation |
|------|------------|
| Silent behavior drift during extraction | Move logic **mechanically**; assert full + submodule suites green before/after against the M0 baseline. |
| `priorDeployedState` shape wrong → M3 churn | Design the upgrade input **now** with M3 in mind; M1-E2's upgrade probe exercises it early. |
| Two lifecycle call sites (pre-deploy filter vs post-deploy registry) make a single pure fn awkward | Split into a shared **candidate-set** helper (pre-deploy) + the **resolve** fn (ownership/cuts); both pure. |

## 6. Notes

- **Behavior-preserving by design** — do **not** fix anything here (no whitelist removal, no dead-code
  deletion). Those are M2/M3 against this seam.
- **Reversible:** revert the single seam commit to restore the inlined logic (no behavior change either way).
- **What stays untouched:** config schema, OZDefender, tests' expectations.
- This is the seed of the `basestrategy-fulfillment` shared selector-resolution core — keep it
  dependency-light and dev-env-agnostic.
