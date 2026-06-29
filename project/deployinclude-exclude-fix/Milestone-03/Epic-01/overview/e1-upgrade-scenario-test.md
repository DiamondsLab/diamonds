# Epic 1 — Upgrade-Scenario Test (PROBE) (M3-E1)

> **Parent milestone:** [Milestone 4 (M3)](../../overview/milestone-04-upgrade-path-and-dead-code-hardening.md)
> **Maps to:** [project-plan](../../../deployinclude-exclude-fix-project-plan.md) → §5 M3, row M3-E1 · Oracle: [architecture §1.1/INV-4](../../../deployinclude-exclude-fix-architecture.md)
> **Owner:** Engineer (agent-assisted) · **Impact / blast radius:** Tests only (no source). **Decisive** — its results set M3-E2's scope. · **Estimated effort:** S–M · **Status:** 📋 planned

## 1. Objective
Probe the **adversarial upgrade-path scenarios** against the pure `resolveFunctionSelectorRegistry` (the
ones M1-E2's single same-facet-redeploy probe — which was **GREEN** — didn't cover). **Run each, record
red/green.** The findings decide whether M3-E2 is a real fix or just documentation.

## 2. Acceptance criteria
- [ ] Unit tests (in `selectorResolution.test.ts` or a new `…upgrade.test.ts`) for these scenarios, each
      constructing a seeded `registry` (prior `Deployed` state) + `newDeployedFacets`:
  - **S-1 include-override-on-upgrade** (the genuine `5b2f7af` path): `S` `Deployed`@X by FacetA; FacetB
    (different facet) `deployInclude`s `S` @Y → expect `S` → FacetB **Replace**@Y.
  - **S-2 selector-moves-facets**: `S` `Deployed`@X by FacetA; on upgrade FacetB exposes `S` (higher
    priority, no directive) → expect `S` → FacetB.
  - **S-3 exclude-on-upgrade**: `S` `Deployed`@X by FacetA; FacetA adds `deployExclude:[S]` → expect `S`
    **Remove**.
  - **S-4 facet-deleted**: FacetA `Deployed`@X with `S`; FacetA absent from config on upgrade → expect
    `S` **Remove**.
- [ ] **Each scenario's actual red/green is RECORDED** (the M0-E2 lesson — measure, don't assume).
- [ ] A findings summary that **sets M3-E2's scope** (real breaks → fix; all-green → E2 is docs only).
- [ ] No source changes; other tests unaffected.

## 3. Tasks
| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | Add an upgrade-scenario helper that seeds a `registry` with `Deployed` entries + builds the upgrade `newDeployedFacets` | Engineer | reusable harness exists |
| 2 | Encode S-1…S-4; assert the expected ownership/action per the oracle | Engineer | 4 scenarios authored |
| 3 | **Run them; record actual red/green per scenario** in the epic CHANGELOG | Engineer | results recorded |
| 4 | Write the findings summary → M3-E2 scope (fix vs docs) | Engineer | scope set; **CHECKPOINT** |

## 4. Dependencies & owner gates
- **Upstream:** M2 (additive fix landed). **Owner gates:** none. **Downstream:** M3-E2 (scope set here), M3-E4 (integration counterpart).

## 5. Risks
| Risk | Mitigation |
|------|------------|
| Assuming a scenario is RED when it's green (or vice-versa) | **Run** every scenario; record real results — don't theorize. |
| Scenarios couple to internal shapes | Assert the stable owner/address/action contract. |

## 6. Notes
- Unit layer (pure fn); the integration counterpart is **M3-E4**. Reversible (new test cases).
- This epic is a **decision gate** — its findings determine how much real work M3-E2 is.
