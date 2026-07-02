# Milestone 4 — Upgrade-path & Dead-code Hardening (M3)

> **Maps to:** [project-plan](../../deployinclude-exclude-fix-project-plan.md) → §5 "M3" · Oracle: [architecture](../../deployinclude-exclude-fix-architecture.md) (INV-4) · Audit: [test-audit-matrix §D](../../Milestone-00/test-audit-matrix.md)
> **Status:** 📋 planned — *exploratory: probe first, then fix what actually breaks.*
> **Prod / impact:** Touches the **most delicate** resolution code (the `5b2f7af` branch, the override). Guarded by the M1 unit oracle + full suite. Now meaningful since integration runs workspace diamonds (M2 wiring).
> **Author:** Am0rfu5 · **Date:** 2026-06-29
> **Epic breakouts:** [e1-upgrade-scenario-test](../Epic-01/overview/e1-upgrade-scenario-test.md) · [e2-cut-action-correctness](../Epic-02/overview/e2-cut-action-correctness.md) · [e3-dead-code-removal](../Epic-03/overview/e3-dead-code-removal.md) · [e4-upgrade-e2e-green](../Epic-04/overview/e4-upgrade-e2e-green.md)

---

## 1. Why this milestone exists — and how M1-E2 narrowed it
The upgrade/redeploy path is the one place the resolution logic was never verified (the `5b2f7af`
`Replace`-branch was added blind). **But M1-E2 already measured that the basic same-facet redeploy
(`Deployed`@X → @Y) resolves to `Replace` correctly — GREEN.** So M3 is **narrower** than feared: it
**probes the adversarial cases** (include-override-on-upgrade, selector-moves-facets, exclude-on-upgrade,
facet-deleted), fixes only what the probe exposes, reconciles the `5b2f7af` patch, and removes the
inverted/dead `higherPrioritySplit`. **Probe-first, measure-don't-assume** (the project's core lesson).

Critical path: `M0 ✅ → M1 ✅ → M2 ✅ → **M3** → M4`.

## 2. Goal & exit criteria
**Goal:** include/exclude resolution is correct + verified on the upgrade/redeploy path; the dead code is
gone. **Exit:**
- [ ] Adversarial upgrade scenarios are **tested** (unit + integration); any genuine breaks are fixed.
- [ ] `Add`/`Replace` are derived correctly from prior `Deployed`/registered state — no
      `"function already exists"` / orphaned-selector revert (INV-4); the `5b2f7af` patch is replaced by
      verified-correct logic **or** confirmed-correct-and-documented.
- [ ] The inverted/dead `registryHigherPrioritySplit` (`entry.priority > priority`) is **removed**;
      behavior preserved (M1 unit oracle + full suite green).
- [ ] Full root `yarn test` + submodule suites green.

## 3. Scope
**In scope**
- Adversarial upgrade-scenario tests (unit against the pure fn; integration deploy→upgrade).
- Fixing the resolution's `Add`/`Replace`/`Deployed`-path correctness where the probe exposes a break.
- Removing the inverted `higherPrioritySplit`; reconciling/replacing the `5b2f7af` branch.

**Out of scope (deferred)**
- INV-7/INV-8 enforcement → validator (DR-3). M4 regression + sign-off. New config-schema.

## 4. Roles
- **Engineer (agent-assisted):** all epics. **Owner:** none blocking.

## 5. Epics
| Epic | Title | Owner | Impact | Breakout |
|------|-------|-------|--------|----------|
| M3-E1 | upgrade-scenario-test (**probe**) | Engineer | High | [e1-upgrade-scenario-test](../Epic-01/overview/e1-upgrade-scenario-test.md) |
| M3-E2 | cut-action-correctness (**fix**) | Engineer | High | [e2-cut-action-correctness](../Epic-02/overview/e2-cut-action-correctness.md) |
| M3-E3 | dead-code-removal | Engineer | Med | [e3-dead-code-removal](../Epic-03/overview/e3-dead-code-removal.md) |
| M3-E4 | upgrade-e2e-green | Engineer | Med | [e4-upgrade-e2e-green](../Epic-04/overview/e4-upgrade-e2e-green.md) |

### M3-E1 — `upgrade-scenario-test` (PROBE) — **the decisive epic**
Author adversarial upgrade-path tests against the **pure** `resolveFunctionSelectorRegistry` (extending
M1-E2's probe): include-override-on-upgrade (selector `Deployed` by FacetA@X, then FacetB deployInclude it
@Y — the genuine `5b2f7af` path); selector-moves-facets; exclude-added-on-upgrade; facet-deleted. **Run
them, record red/green per scenario.** The results **determine M3-E2's scope** — if everything is green
(the `5b2f7af` branch already handles it), M3 collapses to dead-code-removal + documentation. **This is
the checkpoint.**

### M3-E2 — `cut-action-correctness` (FIX) — *scope set by E1*
Fix whatever E1 exposes: derive `Add` vs `Replace` from prior `Deployed`/registered state; replace the
`5b2f7af` patch with verified-correct logic (or confirm + document it); reconcile with
`validateNoOrphanedSelectors` (INV-4). If E1 is all-green, this epic is **documentation only**.

### M3-E3 — `dead-code-removal`
Remove the inverted/dead `registryHigherPrioritySplit` (`entry.priority > priority`) — it never matches a
real higher-priority conflict (the working override is the registry overwrite). **Behavior-preserving:**
the M1 unit oracle + full suite are the guard. Independent of E1/E2.

### M3-E4 — `upgrade-e2e-green`
The **integration** counterpart to E1: a deploy→upgrade test (via `LocalDiamondDeployer`, now wired to
workspace diamonds) asserting correct ownership across a version bump with `DiamondLoupe`. Green.

## 6. Dependencies & sequencing
- **Upstream:** M2 (the wiring — integration now exercises workspace code; the additive fix).
- **Internal:** **E1 (probe) FIRST** — it sets E2's scope (checkpoint after E1). E3 (dead-code) is
  independent + behavior-preserving (can land anytime). E4 (integration) after E2.
- **Downstream:** M4 (regression + sign-off).

## 7. Rollback posture
Per-epic single-purpose commits in the submodule; revert to restore prior behavior. E3 is
behavior-preserving (revert is a no-op behaviorally).

## 8. Risks (milestone-scoped)
| Risk | Mitigation |
|------|------------|
| Touching the `5b2f7af`/override logic regresses fresh-deploy | M1 unit oracle (Fixtures A/B/C green guards) + full suite before/after every change. |
| Probe assumes a break that isn't there (or misses one) | **Run** every scenario, record actual red/green; don't theorize (the M0-E2 lesson). |
| Dead-code removal subtly changes behavior | Remove only the provably-inert split; full suite + unit oracle confirm. |

## 9. Definition of Done for Milestone 4 (M3) — ✅ CLOSED (E1–E3; E4 → M4)
- ✅ Adversarial upgrade scenarios tested at the **unit** layer (M3-E1, 4 scenarios); the one genuine break
  (S-3) fixed (INV-4, M3-E2). **Integration E2E deferred to M4-E2** (no deployer upgrade API).
- ✅ `5b2f7af` confirmed-correct + documented (M3-E1 S-1); dead `higherPrioritySplit` removed (M3-E3).
- ✅ Full root (`191/69/0`) + submodule (`51/0`) suites green. Clean handoff to **M4**.

---
**Next:** `/breakout-epics` (this run) → `/create-prd` per epic → `/generate-tasks` → `/process-task-list`. **Start with E1 (the probe); checkpoint on its findings.**
