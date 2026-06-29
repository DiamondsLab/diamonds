# Epic 3 — Additivity Fixture (M1-E3)

> **Parent milestone:** [Milestone 2 — Testable Resolution Core (M1)](../../overview/milestone-02-testable-resolution-core.md)
> **Maps to:** [project plan](../../../deployinclude-exclude-fix-project-plan.md) → §5 M1 epic table, row M1-E3 · Oracle: [architecture §4.3](../../../deployinclude-exclude-fix-architecture.md) (Fixture C, DR-5) · Audit: [test-audit-matrix §D](../../../Milestone-00/test-audit-matrix.md)
> **Owner:** Engineer (agent-assisted) · **Impact / blast radius:** **Dev-env root** (new config + integration test); no submodule code. · **Estimated effort:** S · **Status:** 📋 planned

## 1. Objective

Provide the **on-chain** proof that distinguishes the approved **additive** semantics from the current
**whitelist** behavior (INV-3) — the integration counterpart to M1-E2's additivity unit RED. Today the
symmetric fixtures (A & B) net to one selector per facet **either way**, so additivity is untestable
without a fixture where the including facet also owns a selector **no higher-priority facet claims**.

## 2. Acceptance criteria

- [ ] `diamonds/ExampleDiamond/examplediamond-include-additive.config.json` (**root** repo) exists: the
      standard core facets (DiamondCut, Loupe, Ownership, Init) **+** `ExampleTestDeployInclude` @60 with
      `deployInclude: ["testDeployInclude()"]`, and **no** `ExampleTestDeployExclude` (so
      `testDeployExclude()` has **no higher-priority competitor**).
- [ ] **No new Solidity** — reuses the existing `ExampleTestDeployInclude` contract (already exposes both
      `testDeployInclude()` and `testDeployExclude()`).
- [ ] A **root integration test** (a new describe block, or `test/deployment/DeployAdditive.test.ts`)
      deploys this config and asserts `ExampleTestDeployInclude` owns **both** `0x7f0c610c` **and**
      `0xdc38f9ab` (via `DiamondLoupe.facetAddress` / `facetFunctionSelectors`).
- [ ] **RED at HEAD** (the deploy-time whitelist drops `0xdc38f9ab`) — recorded as the integration
      counterpart to the M1-E2 additivity unit RED.

## 3. Tasks

| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | Create `examplediamond-include-additive.config.json` (copy the include config; **remove** `ExampleTestDeployExclude`) | Engineer | config parses; Include @60 with `deployInclude:["testDeployInclude()"]`, no Exclude facet |
| 2 | Add the integration test (deploy via `LocalDiamondDeployer`; assert Include owns **both** selectors) | Engineer | test deploys the additive config and asserts both `0x7f0c610c` + `0xdc38f9ab` |
| 3 | Run it; confirm **RED**; annotate (greened in M2) | Engineer | RED at HEAD, documented in the epic CHANGELOG |

## 4. Dependencies & owner gates

- **Upstream:** M0 — Fixture C **spec confirmed buildable** (oracle DR-5). No code dep on M1-E1/E2 (this
  is the on-chain layer; it can be authored in parallel with M1-E2).
- **Owner gates:** **none.**
- **Downstream:** **M2** greens it (whitelist removal); M4 regression confirms it stays green.

## 5. Risks

| Risk | Mitigation |
|------|------------|
| Integration test is slow (on-chain deploy per run) | Keep it **one focused test** / small describe; the unit additivity proof (M1-E2) is the fast guard. |
| Core-facet set in the new config is incomplete → deploy fails for the wrong reason | Copy the working include config and only **remove** the Exclude facet; keep DiamondCut/Loupe/Ownership/Init intact. |

## 6. Notes

- Lives in the **dev-env root** (`diamonds/ExampleDiamond/` config + `test/deployment/` test), **not** the
  submodule — the two-repo split noted in the milestone overview.
- **Reversible:** new files only — revert to remove.
- Pairs with M1-E2: unit (fast) + integration (real) proofs of the same INV-3 gap.
