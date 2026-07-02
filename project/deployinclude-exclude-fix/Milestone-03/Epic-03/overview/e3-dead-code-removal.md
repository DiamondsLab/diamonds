# Epic 3 — Dead-Code Removal (M3-E3)

> **Parent milestone:** [Milestone 4 (M3)](../../overview/milestone-04-upgrade-path-and-dead-code-hardening.md) · **Maps to:** [project-plan](../../../deployinclude-exclude-fix-project-plan.md) §5 M3 row M3-E3 · Oracle: [architecture §1.1](../../../deployinclude-exclude-fix-architecture.md)
> **Owner:** Engineer · **Impact:** Behavior-preserving cleanup of `resolveFunctionSelectorRegistry`. · **Effort:** S · **Status:** 📋 planned

## 1. Objective
Remove the inverted/dead `registryHigherPrioritySplit` (`entry.priority > priority`) from
`resolveFunctionSelectorRegistry`. Since facets process in ascending priority-number order, a real
higher-priority facet (smaller number) never satisfies `> priority`, so the branch never fires — the
working override is the registry **overwrite** (lower-priority include facet processed last). Remove the
dead branch + the now-unreachable `higherPriorityFacet` path; keep the overwrite path.

## 2. Acceptance criteria
- [ ] `registryHigherPrioritySplit` + the `if (higherPriorityFacet)` branch removed from `resolveFunctionSelectorRegistry`.
- [ ] The overwrite-based override is preserved (the `else`/`5b2f7af`/Add path).
- [ ] **Behavior preserved:** M1 unit oracle (Fixtures A/B/C green), `DeployIncludeExclude`/`DeployAdditive` green, full root + submodule suites green — identical to pre-change.

## 3. Tasks
| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | Remove the dead `registryHigherPrioritySplit` block + the `higherPriorityFacet` branch in the Inclusion Override Filter; simplify the remaining override (existingEntry → Replace-on-Deployed / Add) | Engineer | dead code gone |
| 2 | Rebuild; run unit oracle + integration + full suites | Engineer | all green, identical |
| 3 | Commit submodule (`--no-verify`); record | Engineer | committed |

## 4. Dependencies & owner gates
- **Upstream:** M1 unit oracle (the behavior guard). Independent of E1/E2 (can land anytime in M3). **Owner gates:** none.

## 5. Risks
| Risk | Mitigation |
|------|------------|
| The "dead" branch isn't actually dead in some edge case | The M1 unit oracle + the M3-E1 probe scenarios prove behavior preserved before/after. |

## 6. Notes
- Strictly behavior-preserving — if any test changes, STOP (the branch wasn't dead). Coordinate with
  M3-E2 (both edit the Inclusion Override Filter) — land E2 first if it rewrites that region.
