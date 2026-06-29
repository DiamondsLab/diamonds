# Epic 2 — Cross-Strategy Regression (M4-E2)

> **Parent milestone:** [Milestone 5 (M4)](../../overview/milestone-05-regression-and-signoff.md) · **Maps to:** [project-plan](../../../deployinclude-exclude-fix-project-plan.md) §5 M4 row M4-E2
> **Owner:** Engineer · **Impact:** Confirmation (no source). · **Effort:** S–M · **Status:** 📋 planned

## 1. Objective
Confirm the fix holds across the board and nothing else broke: RPC/Local strategies inherit
`BaseDeploymentStrategy`; the broader root + submodule suites pass; the hardhat-diamonds `signer` change is
not implicated; OZDefender still compiles. **Plus** the upgrade integration E2E deferred from M3-E4.

## 2. Acceptance criteria
- [ ] RPC/Local inherit the additive/upgrade fixes (they delegate to `BaseDeploymentStrategy` → the pure
      core) — confirmed by the green suites (no RPC/Local-specific override of resolution).
- [ ] `DiamondDeployment` + the broader root suite green; submodule full suite green.
- [ ] The hardhat-diamonds `signer` change is ruled **in or out** against the green baseline (it is not a
      factor in include/exclude resolution).
- [ ] OZDefender still **compiles** (deprecated; excluded from behavior, must build).
- [ ] **Upgrade E2E (from M3-E4):** built if a clean deploy→upgrade is feasible; else this epic **records
      M3-E1's unit probe as the verification of record** with a one-line rationale.

## 3. Tasks
| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | Run full root `yarn test` + submodule full suite; confirm green (191/69/0; 70/7+/0) | Engineer | green |
| 2 | Confirm RPC/Local have no own resolution override (grep) → they inherit the fix | Engineer | confirmed |
| 3 | Rule the hardhat-diamonds `signer` change in/out (it doesn't touch resolution) | Engineer | recorded |
| 4 | Confirm OZDefender compiles (tsc) | Engineer | builds |
| 5 | Upgrade E2E: assess feasibility; build OR record M3-E1 unit coverage as the record | Engineer | done or documented |

## 4. Dependencies & owner gates
- **Upstream:** M3 (the fixes). **Owner gates:** none. **Downstream:** M4-E3 sign-off.

## 5. Risks
| Risk | Mitigation |
|------|------------|
| A strategy overrides resolution and misses the fix | Grep for resolution overrides in RPC/Local/OZDefender; the suites confirm. |

## 6. Notes
- Mostly confirmation (the suite is already green). The upgrade E2E is the one open build item (likely documented).
