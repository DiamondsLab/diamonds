# Change Plan (PRD) — M3-E1 Upgrade-Scenario Test (PROBE)

> **Epic overview:** [e1-upgrade-scenario-test.md](overview/e1-upgrade-scenario-test.md) · **Parent:** [Milestone 4 (M3)](../overview/milestone-04-upgrade-path-and-dead-code-hardening.md) · **Oracle:** INV-4
> **Status:** 📋 ready · **Owner:** Engineer (agent-assisted) · **Date:** 2026-06-29

## 1. Overview & Problem
The upgrade/redeploy path of `resolveFunctionSelectorRegistry` is unverified (the `5b2f7af` branch was
added blind). M1-E2 measured that the basic same-facet redeploy is GREEN. **Goal:** probe the adversarial
upgrade scenarios — **run them, record red/green** — to set M3-E2's scope (real fix vs documentation).

## 2. Goals
- Unit tests for **S-1 include-override-on-upgrade**, **S-2 selector-moves-facets**, **S-3
  exclude-on-upgrade**, **S-4 facet-deleted** against the pure `resolveFunctionSelectorRegistry`, each
  seeding a prior `Deployed` registry state.
- Actual red/green per scenario **recorded**; a findings summary that sets M3-E2 scope.

## 3. Scope — Components & Services
- **New (submodule):** `packages/diamonds/test/unit/selectorResolutionUpgrade.test.ts` (imports the pure
  core; constructs seeded registry + upgrade `newDeployedFacets`). No source changes.

## 4. Stakeholders & Impact
- **Affected:** M3-E2 (scope), M3-E4 (integration counterpart). **User-facing:** none (unit tests).

## 5. Operational Requirements
1. Each scenario MUST seed a `registry` with the prior `Deployed` entry/entries and call
   `resolveFunctionSelectorRegistry({ registry, newDeployedFacets, facetNames })` with the upgrade inputs.
2. Each MUST assert the **oracle's** expected `{ facetName, address, action }` end-state.
3. **Each scenario's actual red/green MUST be recorded** (do not assume); annotate any RED with the
   target fix.
4. A findings summary MUST set M3-E2's scope.
5. No source changes; other tests unaffected.

## 6. Security & Compliance Considerations
- None (unit tests; no secrets/provider/production).

## 7. Non-Goals (Out of Scope)
- Fixing anything (M3-E2); dead-code removal (M3-E3); integration (M3-E4).

## 8. Risk, Rollback & Recovery
- **Risk:** wrong assumption about red/green. **Mitigation:** RUN every scenario; record actuals.
- **Rollback:** delete the test file. No backup required.

## 9. Validation / Success Metrics
- The 4 scenarios run; per-scenario red/green recorded; M3-E2 scope set. Other unit tests unaffected.

## 10. Open Questions
- Whether to also add an integration counterpart now — no, that's M3-E4 (after the fix).
