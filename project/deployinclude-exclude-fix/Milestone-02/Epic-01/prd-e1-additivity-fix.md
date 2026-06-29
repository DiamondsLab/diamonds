# Change Plan (PRD) — M2-E1 Additivity Fix

> **Epic overview:** [e1-additivity-fix.md](overview/e1-additivity-fix.md) · **Parent milestone:** [Milestone 3 (M2)](../overview/milestone-03-additivity-and-test-correctness.md) · **Oracle:** [architecture §2.2](../../deployinclude-exclude-fix-architecture.md)
> **Status:** 📋 ready for `/generate-tasks` · **Owner:** Engineer (agent-assisted) · **Date:** 2026-06-29

## 1. Overview & Problem
`deployInclude` is a **whitelist** at deploy time — it drops a facet's non-included selectors (M1 proved
this RED, unit + integration). **Goal:** make it **additive** (INV-3) by removing that whitelist from
`computeFacetSelectors`; green both M1 REDs without touching the override logic.

## 2. Goals
- `computeFacetSelectors` candidate set = ABI selectors **minus `deployExclude` only** (no include whitelist).
- M1-E2 unit additivity test green; `DeployAdditive.test.ts` un-skipped + green.
- Fixtures A/B + full root + submodule suites stay green; `resolveFunctionSelectorRegistry` unchanged.

## 3. Scope — Components & Services
- **Edit (submodule):** `packages/diamonds/src/resolution/selectorResolution.ts` — remove the `deployInclude`
  whitelist block in `computeFacetSelectors` (+ docstring).
- **Edit (root):** `test/deployment/DeployAdditive.test.ts` — un-skip the additivity test (`it.skip` → `it`).
- **Build:** `yarn workspace @diamondslab/diamonds build` (root consumes dist).
- **Unchanged:** `resolveFunctionSelectorRegistry` (override), contracts, config schema.

## 4. Stakeholders & Impact
- **Affected:** the deployment library's `deployInclude` semantics (now additive). No production/published surface.
- **User-facing impact:** none beyond the library behavior the project exists to correct.

## 5. Operational Requirements
1. The `deployInclude` whitelist (the `if (deployInclude.length > 0) { … return result.filter(…) }` block)
   MUST be removed from `computeFacetSelectors`; the `deployExclude` removal MUST remain.
2. `resolveFunctionSelectorRegistry` MUST be **unchanged** (the override stays there).
3. The submodule MUST be rebuilt before root tests.
4. `DeployAdditive.test.ts`'s additivity test MUST be **un-skipped**.
5. **All green:** M1-E2 unit suite, `DeployAdditive`, `DeployIncludeExclude` (A/B), full root `yarn test`,
   submodule suite — no regression.
6. The submodule fix is committed on `feature/resolution-seam` (`--no-verify`); the root un-skip is left
   **uncommitted** (per owner convention).

## 6. Security & Compliance Considerations
- None — pure library logic + a test un-skip; no secrets/provider/production. No approval gate.

## 7. Non-Goals (Out of Scope)
- Touching the override / dead `higherPrioritySplit` / `5b2f7af` → M3.
- Rewriting vacuous assertions → M2-E2.
- Config-schema changes; OZDefender.

## 8. Risk, Rollback & Recovery
- **Risk:** A/B regress. **Mitigation:** the symmetric fixtures reclaim the non-included selector via
  higher-priority resolution; full suite + M1 oracle confirm before/after.
- **Rollback:** revert the one whitelist block + the un-skip. **No backup required** (version-controlled).

## 9. Validation / Success Metrics
- M1-E2 unit suite green (additivity now passes); `DeployAdditive` green; `DeployIncludeExclude` 17/17;
  full root `yarn test` green (≥190 passing / 0 failing); submodule suite green.

## 10. Open Questions
- None material — the change is a single-block removal with a clear oracle.
