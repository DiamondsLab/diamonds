# Epic 1 — Additivity Fix (M2-E1)

> **Parent milestone:** [Milestone 3 — Additivity & Test Correctness (M2)](../../overview/milestone-03-additivity-and-test-correctness.md)
> **Maps to:** [project-plan](../../../deployinclude-exclude-fix-project-plan.md) → §5 M2, row M2-E1 · Oracle: [architecture §2.2/§4.3](../../../deployinclude-exclude-fix-architecture.md)
> **Owner:** Engineer (agent-assisted) · **Impact / blast radius:** Library behavior change (`deployInclude` semantics) — guarded by the M1 oracle + full suite. · **Estimated effort:** S · **Status:** 📋 planned

## 1. Objective
Make `deployInclude` **additive** (INV-3): a facet keeps its non-included selectors. The single root cause
is the deploy-time **whitelist** in `computeFacetSelectors` (extracted in M1-E1). Removing it greens both
M1 REDs (unit + integration) without changing the override logic in `resolveFunctionSelectorRegistry`.

## 2. Acceptance criteria
- [ ] `computeFacetSelectors` no longer filters to only the `deployInclude` set — the candidate set is the
      facet's ABI selectors **minus `deployExclude` only**.
- [ ] The M1-E2 **unit** additivity test passes (`computeFacetSelectors([X,Y],["funcX()"],[])` → `[X,Y]`).
- [ ] `DeployAdditive.test.ts` additivity test **un-skipped** and **green** (`ExampleTestDeployInclude` owns
      both `0x7f0c610c` and `0xdc38f9ab`).
- [ ] **No regression:** Fixtures A/B (unit + `DeployIncludeExclude` integration) still green; full root
      `yarn test` green; submodule suite green.
- [ ] `resolveFunctionSelectorRegistry` is **unchanged** (override stays where it is).

## 3. Tasks
| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | Remove the `deployInclude` whitelist block in `computeFacetSelectors`; keep the `deployExclude` removal; update the docstring (drop the "whitelist/M2" note) | Engineer | candidate set = ABI minus exclude |
| 2 | Rebuild the submodule (`yarn workspace @diamondslab/diamonds build`) | Engineer | dist updated |
| 3 | Un-skip the `DeployAdditive` additivity test (`it.skip` → `it`) | Engineer | test active |
| 4 | Run: M1-E2 unit suite, `DeployAdditive`, Fixtures A/B (`DeployIncludeExclude`), full root `yarn test`, submodule suite | Engineer | all green |
| 5 | Commit the submodule fix (`feature/resolution-seam`, `--no-verify`); leave the root un-skip uncommitted | Engineer | committed + recorded |

## 4. Dependencies & owner gates
- **Upstream:** M1 (the REDs + the seam). **Owner gates:** none. **Downstream:** M3, M4.

## 5. Risks
| Risk | Mitigation |
|------|------------|
| A/B regress when the whitelist is removed | The symmetric fixtures reclaim the non-included selector via higher-priority resolution; full suite + M1 oracle confirm. |
| The override stops firing | `resolveFunctionSelectorRegistry` untouched; integration `DeployAdditive` + Fixture B prove ownership. |

## 6. Notes
- **Two repos:** the fix is submodule (`src/resolution`); the un-skip is root (`test/deployment`).
- Reversible: revert the one whitelist block + the un-skip.
- Do **not** touch the override / dead `higherPrioritySplit` / `5b2f7af` — those are M3.
