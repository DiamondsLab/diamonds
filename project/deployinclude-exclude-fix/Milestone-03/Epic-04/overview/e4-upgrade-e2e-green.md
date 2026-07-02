# Epic 4 — Upgrade E2E Green (M3-E4)

> **Parent milestone:** [Milestone 4 (M3)](../../overview/milestone-04-upgrade-path-and-dead-code-hardening.md) · **Maps to:** [project-plan](../../../deployinclude-exclude-fix-project-plan.md) §5 M3 row M3-E4
> **Owner:** Engineer · **Impact:** Root integration test (no source). · **Effort:** S–M · **Status:** ⏸️ **DEFERRED to M4 (2026-06-29)**

> ⏸️ **DEFERRED to M4 (owner-decided 2026-06-29).** `LocalDiamondDeployer` has no upgrade API, so an
> in-process deploy→upgrade E2E is high-effort/flaky and exercises the deployer's upgrade *orchestration*
> more than the resolution. The upgrade **resolution** (incl. the M3-E2 S-3 fix) is fully unit-verified by
> M3-E1's 4-scenario probe. The integration confirmation is folded into **M4-E2** (build it if feasible;
> else M3-E1's unit coverage is the verification of record). The objective below is retained for M4.

## 1. Objective
The **integration** counterpart to M3-E1: a deploy→upgrade test via `LocalDiamondDeployer` that bumps a
facet version (changing include/exclude and/or redeploying a facet) and asserts correct ownership across
the bump with `DiamondLoupe.facetAddress`/`facetFunctionSelectors`. Confirms the upgrade path end-to-end.

## 2. Acceptance criteria
- [ ] A `test/deployment/DeployUpgrade.test.ts` (root) deploys a config, then upgrades (new version / facet
      redeploy / include-or-exclude change), asserting the ownership end-state per the oracle via loupe.
- [ ] Green (after M3-E2's fix, if any); root `yarn test` stays green.
- [ ] Mirrors the M3-E1 scenario(s) that matter most at the integration layer.

## 3. Tasks (provisional — finalized after M3-E1/E2)
| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | Choose the integration upgrade scenario(s) from M3-E1's findings (the riskiest one(s)) | Engineer | scenario chosen |
| 2 | Build the upgrade config(s)/fixture + `DeployUpgrade.test.ts` (deploy → upgrade → assert via loupe) | Engineer | test deploys + asserts |
| 3 | Run; confirm green; root files uncommitted (convention); record | Engineer | green + recorded |

## 4. Dependencies & owner gates
- **Upstream:** M3-E1 (scenarios) + M3-E2 (fix). **Owner gates:** none. **Downstream:** M4.

## 5. Risks
| Risk | Mitigation |
|------|------------|
| The deployer's upgrade flow (version bump) is itself unexercised | Start from a known-good config + a minimal version bump; lean on M3-E1's unit findings. |

## 6. Notes
- Root integration test → leave uncommitted (convention). Depends on M3-E2 landing the fix first.
