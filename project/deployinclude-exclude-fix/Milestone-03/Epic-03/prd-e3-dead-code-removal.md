# Change Plan (PRD) — M3-E3 Dead-Code Removal

> **Epic overview:** [e3-dead-code-removal.md](overview/e3-dead-code-removal.md) · **Parent:** [Milestone 4 (M3)](../overview/milestone-04-upgrade-path-and-dead-code-hardening.md) · **Oracle:** [architecture §1.1](../../deployinclude-exclude-fix-architecture.md)
> **Status:** 📋 ready · **Owner:** Engineer (agent-assisted) · **Date:** 2026-06-29

## 1. Overview & Problem
`resolveFunctionSelectorRegistry` computes `registryHigherPrioritySplit` (`entry.priority > priority`) and
a `higherPriorityFacet` branch in the Inclusion Override Filter. **Analysis:** the only cases it fires
(a lower-priority facet's selector being include-overridden — possible only on upgrades with seeded
`Deployed` state) **already satisfy the `5b2f7af` `Replace` branch with the identical result** (different
address + non-`Add` → `Replace`). It is inert for fresh deploys and redundant for upgrades. **Goal:**
remove it; behavior strictly preserved (guarded by the M1 oracle + M3-E1 probe + full suite).

## 2. Goals
- `registryHigherPrioritySplit` + the `if (higherPriorityFacet)` branch removed; the Inclusion Override
  Filter reduced to `5b2f7af`-else-if + Add-else.
- **Behavior identical:** M1 unit oracle, M3-E1 probe (4/4), `DeployIncludeExclude`/`DeployAdditive`, full
  root + submodule suites all green — unchanged.

## 3. Scope — Components & Services
- **Edit (submodule):** `packages/diamonds/src/resolution/selectorResolution.ts` (the split block + the
  `higherPriorityFacet` branch). **Build:** `yarn workspace @diamondslab/diamonds build`. **Unchanged:**
  the `5b2f7af`/Add paths, exclude filter, priority resolution.

## 4. Stakeholders & Impact
- **Affected:** code clarity only (dead branch gone). No behavior change. No production surface.

## 5. Operational Requirements
1. Remove the `registryHigherPrioritySplit` computation and the `if (higherPriorityFacet) { … }` branch;
   keep the `else if (5b2f7af)` and `else (Add)` paths (the else-if becomes the first condition).
2. The `_` unused destructure (`([_, entry]) => entry.priority > priority`) goes away with the block.
3. **Strictly behavior-preserving** — if ANY test changes, STOP (the branch wasn't dead).
4. Rebuild; **all green & identical:** M1 oracle, M3-E1 probe 4/4, root `DeployIncludeExclude`/`DeployAdditive`,
   full root `yarn test` 191/69/0, submodule `test:unit` 51/0.
5. Commit submodule (`--no-verify`); update the oracle doc §1.1 (the split is now removed).

## 6. Security & Compliance Considerations
- None — pure library cleanup.

## 7. Non-Goals (Out of Scope)
- Touching the `5b2f7af`/Add/exclude/priority logic. Integration test → M3-E4.

## 8. Risk, Rollback & Recovery
- **Risk:** the branch isn't actually dead in some untested case. **Mitigation:** the M1 oracle + the M3-E1
  upgrade probe (incl. the lower-priority-Deployed case via S-1/S-2) + full suite confirm before/after.
  **Rollback:** revert the deletion.

## 9. Validation / Success Metrics
- Full root `yarn test` 191/69/0; submodule `test:unit` 51/0; M3-E1 probe 4/4 — all **identical** to pre-change.

## 10. Open Questions
- None — the removal is bounded and test-guarded.
