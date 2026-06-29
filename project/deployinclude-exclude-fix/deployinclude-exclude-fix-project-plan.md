# Project Plan — Harden `deployInclude` / `deployExclude` Selector Resolution (TDD)

> **Status:** ✅ **PROJECT CLOSED — Owner signed off 2026-06-29 (M4-E3 / OP-2).** All milestones M0–M4 complete; suite green (root 190/70/0, submodule 51/0); design verified against real workspace code. Diamonds fix on `feature/resolution-seam` (6 commits); infra (hardhat-diamonds `workspace:*` wiring + lockfiles + root test files) left uncommitted per owner.
> ~~**Status:** 📋 plan of record — *for owner approval (reframed 2026-06-27 after baseline capture).*~~
> **Author:** Am0rfu5 · **Date:** 2026-06-27
> **Companion design (read first):** [deployinclude-exclude-fix-architecture.md](./deployinclude-exclude-fix-architecture.md) — the authoritative **TDD oracle** (semantics, invariants, truth table). This plan **executes** that spec.
> **Verified at HEAD (2026-06-27, `packages/diamonds` @ `dd4ddf9` / `release/v1.3.3`):** the full root suite is **green** (189 passing / 0 failing) and single-sided `deployInclude`/`deployExclude` already resolve correctly for **fresh deploys** — the `release/v1.3.3` fixes closed that case. This project is therefore **design-hardening**, not a red-test fix.
> **Governing constraint:** Drive the work by **TDD (red → green → refactor)** against the oracle, targeting the genuine open gaps — **(a)** additivity (INV-3) is untested, **(b)** the upgrade/redeploy path is unexercised, **(c)** dead/inverted resolution code remains; **do not change the config schema** (INV-5); scope to `BaseDeploymentStrategy` (RPC/Local inherit it); **OZDefender is excluded** (deprecated). "Done" = the gaps are closed, every oracle rule is pinned by a non-vacuous passing test, and the full suite stays green.

---

## 1. How to read this plan

- The work is decomposed into **milestones** (`M0…M4`) — each independently valuable and leaving the
  repo in a working state — and **epics** (`M<n>-E<m>`). Later commands explode these into PRDs, task
  lists, and execution.
- **Naming:** milestones `M0..Mn` (zero-indexed; `M0` = foundations); epics `M<n>-E<m>`; kebab-case
  slugs. Directories `Milestone-00`, `Epic-01`; milestone **overview filename/title** uses the 1-based
  human number (`M0` → `milestone-01-…` / "Milestone 1").
- **Two repos, one fix:** the **source** change is in the `@diamondslab/diamonds` submodule
  (`packages/diamonds/src/strategies/BaseDeploymentStrategy.ts`); the **integration tests** that prove
  it are in the dev-env root (`test/deployment/`). Both are in scope.
- **Roles:** **Owner** (Am0rfu5) — approves the oracle, semantics, and final design sign-off (blocking
  gates). **Engineer (agent-assisted)** — writes tests and code. No third-party/credentialed steps.

## 2. Objectives & success criteria

| # | Objective | Measurable definition of done |
|---|-----------|-------------------------------|
| O1 | `deployExclude` works **independently** | **Verified at HEAD** for fresh deploys (excluded selector never owned; absent if unclaimed — INV-1/INV-6). Add a **direct, non-vacuous** test and confirm it also holds on **upgrades/redeploys**. |
| O2 | `deployInclude` overrides **independently** | **Verified at HEAD** for fresh deploys (override via registry overwrite — INV-2). Add a direct test and confirm it holds on **upgrades/redeploys** (the unexercised path). |
| O3 | `deployInclude` is **additive** | A new discriminator fixture (Fixture C) proves the including facet **keeps** its other (unclaimed) selectors (INV-3) — distinguishing additive from the current whitelist behavior. **This is the headline gap.** |
| O4 | On-chain cuts are correct on **upgrades** | Cut applies with correct `Add`/`Replace` on the redeploy/`Deployed` path (which **no current test hits**), **no** `"function already exists"` / orphaned-selector reverts; the `5b2f7af` workaround is replaced by verified-correct logic (INV-4). |
| O5 | Tests express the design (no vacuous passes) | Assertions that pass **vacuously** (e.g. `DeployIncludeExclude.test.ts:142-164` — its `registry.has(...)` guard is false at HEAD, so it asserts nothing) are rewritten to assert the oracle **directly**. Each invariant ↔ a named test. |
| O6 | No regressions, no schema change | Full `yarn test` stays green; `forge` unaffected; schema shape unchanged (INV-5); RPC/Local inherit correctly; OZDefender still compiles. |

**Overarching acceptance gate:** `yarn test` (root) **and** the new diamonds-submodule unit suite are
green, **and** the §11 traceability matrix shows every invariant (INV-1…INV-9) covered by ≥1 **non-vacuous**
passing test, **and** the Owner signs off that the suite expresses the approved design.

## 3. Guiding execution principles

- **Oracle-first.** No code change before the spec (companion doc) is Owner-approved (M0 gate). The
  spec is authoritative; code conforms to it.
- **Red before green.** Every behavioral change is preceded by a failing test that encodes the oracle —
  here the genuine REDs are the **additivity (Fixture C)** and **upgrade-path** cases.
- **Unit before chain.** Prefer fast, pure selector-resolution unit tests in the submodule; use the
  root on-chain integration tests to confirm end-to-end.
- **One change at a time.** Land additivity (M2) before upgrade-path/dead-code (M3) to de-risk; they
  edit the same resolution logic.
- **Behavior-preserving refactor only where needed.** Extract a testable resolution seam without
  changing unrelated behavior; align it with the future shared core but keep it minimal.
- **No schema drift.** Keep `deployInclude`/`deployExclude` shapes; the legacy both-sides config must
  keep producing the same result (INV-5).
- **Submodule discipline.** Source lands in `packages/diamonds` (its own git history / PR); the
  dev-env root bumps the submodule pointer and updates root tests.

## 4. Milestone map (at a glance)

| Milestone | Title | Outcome | Impact / Risk |
|-----------|-------|---------|---------------|
| **M0** | Oracle & **true baseline** | Approved spec + **verified green-at-HEAD baseline** + demonstrated genuine gaps (additivity, upgrade-path) + test-audit matrix | High value / Low risk — no code yet |
| **M1** | Testable resolution core | Pure/injectable resolution seam + table-driven unit tests; fixtures A/B green, **additivity + upgrade RED** | High value / Med risk — light refactor |
| **M2** | **Additivity & test correctness** | `deployInclude` made **additive** (deploy-time whitelist removed, INV-3); Fixture C green; vacuous assertions rewritten | High / Med |
| **M3** | **Upgrade-path & dead-code hardening** | Upgrade/redeploy include/exclude exercised + fixed (the real "both-sides" risk); inverted `higherPrioritySplit` removed; `5b2f7af` reconciled | High / Med-High — core logic + on-chain cuts |
| **M4** | Regression & design sign-off | Edge cases, cross-strategy, full suite green; traceability matrix; Owner sign-off | High / Med |

**Critical path:** `M0 → M1 → M2 → M3 → M4`. M2 (additivity) and M3 (upgrade-path/dead-code) both edit
the same resolution logic, so **integrate sequentially** (M2 first — simpler/lower-risk). M4 depends on both.

```
M0 ──> M1 ──> M2 ──> M3 ──> M4
              (M2 = additivity; M3 = upgrade-path + dead-code; both edit the resolution logic)
```

## 5. Milestones & epics

### M0 — Oracle & true baseline (foundations)
**Goal:** Lock the authoritative semantics and establish the **true** baseline before touching code.
**Exit criteria:** (a) companion spec **Owner-approved**; (b) baseline recorded — **full suite green at
HEAD**, fresh-deploy single-sided behavior verified correct, and the genuine gaps (additivity, upgrade-path)
demonstrated as the real RED; (c) a test-audit matrix mapping each assertion to keep / rewrite (incl.
**vacuous passes**) / add.

| Epic | Title | Summary | Owner | Impact |
|------|-------|---------|-------|--------|
| M0-E1 | `selector-resolution-spec` | ✅ **Ratified & frozen 2026-06-28 (OP-1 cleared).** Owner accepted the reframed oracle; decided **INV-7 = hard error** and **INV-8 = hard error**, with **enforcement deferred to the `basestrategy-fulfillment` validator** (oracle §7 DR-0…DR-5). M1 unblocked. | Owner | High |
| M0-E2 | `baseline-capture` | **Done (2026-06-27):** full `yarn test` = 189 pass / 0 fail; single-sided fixtures correct for fresh deploys; `5b2f7af` characterized as upgrade-path-only. **Remaining:** demonstrate the genuine RED (additivity gap + upgrade-path repro). | Engineer | Med |
| M0-E3 | `test-audit-matrix` | ✅ **Done 2026-06-28.** All 23 `it()` classified ([test-audit-matrix.md](Milestone-00/test-audit-matrix.md)): 19 keep · 2 correct (**B4** vacuous L142-164 → assert INV-6 absence; **B17** L569-591 contradicts INV-7 → pending/deferred) · gaps = **INV-3 additivity** + **upgrade path**. | Engineer | High |

### M1 — Testable resolution core (TDD unit harness)
**Goal:** Make selector resolution unit-testable without a chain, and write the oracle as fast
table-driven unit tests. **Exit criteria:** a pure/injectable resolution function exists in
`packages/diamonds`, exercised by table-driven unit tests encoding §4 of the spec — **fixtures A/B pass**
(behavior already correct), while the **additivity (Fixture C)** and **upgrade-path** cases are **RED**;
new Fixture C authored.

| Epic | Title | Summary | Owner | Impact |
|------|-------|---------|-------|--------|
| M1-E1 | `resolution-seam` | Extract registry resolution (the body of `updateFunctionSelectorRegistryTasks` + the deploy-time include/exclude filters) into a pure, dependency-light function taking facet configs/ABIs/priorities → ownership + cut actions. Behavior-preserving; seeds the future shared core. | Engineer | High |
| M1-E2 | `unit-oracle-tests` | Table-driven unit tests asserting the §4 truth table + INV-1…9 against the pure function (Fixtures A, B, **C-additive**, **upgrade**, edge cases). A/B green; **C-additive + upgrade RED**. | Engineer | High |
| M1-E3 | `additivity-fixture` | Add `examplediamond-include-additive.config.json` (+ any contract wiring) proving INV-3 (additive ≠ whitelist). | Engineer | Med |

### M2 — Additivity & test correctness
**Goal:** Make `deployInclude` **additive** (a facet keeps its non-included selectors) and replace vacuous
assertions with direct ones. **Exit criteria:** Fixture C (additivity) green; the deploy-time whitelist
removed; `L142-164` (and siblings) rewritten to assert the oracle directly; full suite still green.

| Epic | Title | Summary | Owner | Impact |
|------|-------|---------|-------|--------|
| M2-E1 | `additivity-fix` | Remove the deploy-time `deployInclude` whitelist ([BaseDeploymentStrategy.ts:223-238](../../src/strategies/BaseDeploymentStrategy.ts#L223-L238)) so a facet keeps its non-included selectors; they undergo normal priority resolution (INV-3). Make Fixture C green. | Engineer | High |
| M2-E2 | `test-correction` | Rewrite vacuous/indirect assertions (`DeployIncludeExclude.test.ts:142-164` and siblings) to assert the oracle **directly** (absence via `facetAddress == 0`, INV-6); align `SelectorRegistration.test.ts`. | Engineer | High |

### M3 — Upgrade-path & dead-code hardening
**Goal:** Make include/exclude correct on the **upgrade/redeploy** path (where facets are `Deployed` at a
different address — the likely home of the original "both-sides" pain), and remove dead/inverted code.
**Exit criteria:** a new upgrade-scenario test (deploy → upgrade with include/exclude change) is green; the
inverted `higherPrioritySplit` is removed; the `5b2f7af` workaround is replaced by verified-correct
`Add`/`Replace` derivation; no on-chain revert / orphaned-selector error (INV-4).

| Epic | Title | Summary | Owner | Impact |
|------|-------|---------|-------|--------|
| M3-E1 | `upgrade-scenario-test` | Add a deploy→upgrade fixture/test that changes include/exclude across versions (and redeploys a facet to a new address); assert correct ownership end-state. Written **RED** if it exposes a break. | Engineer | High |
| M3-E2 | `cut-action-correctness` | Derive `Add` vs `Replace` from prior registered/`Deployed` state; replace the `5b2f7af` patch with verified-correct logic; reconcile with `validateNoOrphanedSelectors` so no `"function already exists"` revert (INV-4). | Engineer | High |
| M3-E3 | `dead-code-removal` | Remove the inverted/dead `registryHigherPrioritySplit` (`entry.priority > priority`); keep the (working) overwrite-based override; prove behavior preserved by the M1 unit tests. | Engineer | Med |
| M3-E4 | `upgrade-e2e-green` | **DEFERRED to M4 (2026-06-29):** `LocalDiamondDeployer` has no upgrade API → an in-process deploy→upgrade E2E is high-effort/flaky and exercises the deployer's upgrade *orchestration* more than the resolution. The upgrade **resolution** (incl. the S-3 fix) is fully unit-verified by M3-E1. Folded into M4 regression. | Engineer | Med |

### M4 — Regression, edge cases & design sign-off
**Goal:** Prove the whole design holds and nothing else broke. **Exit criteria:** full `yarn test`
green; edge-case fixtures pass per oracle; RPC/Local inheritance verified; signer change ruled out as a
factor; traceability matrix complete; **Owner sign-off**.

| Epic | Title | Summary | Owner | Impact |
|------|-------|---------|-------|--------|
| M4-E1 | `edge-case-configs` | `invalid-include` / `invalid-exclude` (INV-9) assert the oracle directly. `include-and-exclude` (INV-7) → **pending/deferred** (invalid config; **enforcement is the validator's**, oracle DR-3/DR-4) — not "handled successfully". | Engineer | Med |
| M4-E2 | `cross-strategy-regression` | Confirm RPC/Local inherit correctly; run the broader suite (`DiamondDeployment`, etc.); confirm the hardhat-diamonds `signer` change is not implicated; OZDefender still compiles. **+ the upgrade integration E2E deferred from M3-E4** (deploy→upgrade via the deployer, if feasible; else document the M3-E1 unit coverage as the verification of record). | Engineer | Med |
| M4-E3 | `design-confirmation-signoff` | Build the §11 traceability matrix (invariant ↔ test); **blocking Owner sign-off** that the suite expresses the design. | Owner | High |

## 6. Cross-cutting workstreams
- **CHANGELOG / commits** — Conventional Commits in the submodule; per-epic `CHANGELOG.md`; root commit bumps the submodule pointer.
- **Spec ↔ test traceability** — maintained continuously (every invariant maps to a **non-vacuous** named test); finalized in M4-E3.
- **Verification discipline** — each milestone ends with the relevant suite green before the next begins (red→green gate). **Exception: M1** is the TDD-harness milestone — it intentionally lands the **additivity** (→ greened in M2) and **upgrade-path** (→ greened in M3) oracle tests **RED**; these are the only sanctioned standing REDs and must be clearly marked as expected, not regressions.
- **No-schema-change guard** — a standing check that no edit alters the `deployInclude`/`deployExclude` config shape (INV-5).

## 7. Dependencies & sequencing rules
- M0-E1 (spec approval) is a **hard gate** before any M1+ code.
- M1 (pure seam + RED tests) precedes the fixes — the fixes are "make the RED M1 cases green".
- M2 integrates before M3 (same logic); both author against the M1 unit harness.
- M4 requires M2 **and** M3 merged.
- Submodule source must land (and its pointer bump) before root integration tests can go green in CI.
- **Cross-project dependency (oracle DR-3):** INV-7/INV-8 **enforcement** (hard error on dual-list / dual-include) is owned by the `basestrategy-fulfillment` **config validator**, not this project. Here we spec the policy and reframe the contradicting `include-and-exclude` test to pending/deferred.

## 8. Risk register (plan-level)

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|-----------|--------|------------|-------|
| Reframe loses sight of a real residual bug | Med | High | M0-E2's upgrade-path repro must actually run; don't declare "green" without exercising upgrades | Engineer |
| Removing the deploy-time whitelist breaks fixture A/B end-states | Med | High | M1 unit harness + full suite guard; additivity change is additive-only by construction | Engineer |
| Upgrade-path fix reintroduces on-chain revert / orphaned selectors | Med | High | INV-4 tests + `validateNoOrphanedSelectors`; test `Add`/`Replace` derivation on the `Deployed` path explicitly | Engineer |
| Additivity (INV-3) stays untested (current fixtures net to 1 either way) | High | Med | M1-E3 discriminator fixture is **mandatory**, not optional | Engineer |
| Assertions pass **vacuously** and mask behavior | High | Med | M0-E3 audit flags every guard-gated/empty assertion; M2-E2 rewrites them to assert directly | Engineer |
| Hidden coupling to hardhat-diamonds `signer` change | Low | Med | M4-E2 explicitly rules it in/out against the baseline | Engineer |
| Divergence from `basestrategy-fulfillment` redesign | Med | Low | Author the seam as a promotable shared-core seed; keep schema frozen | Owner |
| Submodule/root sync confusion in CI | Med | Med | Land submodule first, bump pointer, then root; document in CHANGELOG | Engineer |

## 9. Rollback posture per milestone
- **M0** — docs only; revert files.
- **M1** — new pure function + tests are additive; revert the seam commit (no behavior change yet).
- **M2 / M3** — single-purpose commits in the submodule; revert the commit and the pointer bump to restore prior behavior.
- **M4** — test/fixture changes; revert individually. No production/outward-facing surface (library + local tests only).

## 10. Deliverables checklist (project-level)
- [x] Owner-ratified & frozen companion spec (oracle), incl. INV-7/INV-8 = hard error (enforcement deferred) — M0-E1 ✅
- [x] Verified baseline (green-at-HEAD) + test-audit matrix (23 `it()` classified) — M0 ✅
- [ ] Pure selector-resolution function + table-driven unit tests — M1
- [ ] `examplediamond-include-additive.config.json` discriminator fixture — M1-E3
- [ ] `deployInclude` additivity fix (deploy-time whitelist removed) + rewritten vacuous assertions — M2
- [ ] Upgrade-path correctness + dead `higherPrioritySplit` removed; `5b2f7af` reconciled — M3
- [ ] Edge-case fixtures asserting the oracle — M4-E1
- [ ] Full `yarn test` green; RPC/Local verified; OZDefender compiles — M4-E2
- [ ] Invariant ↔ test traceability matrix + Owner sign-off — M4-E3

## 11. Traceability matrix (to be completed by M4-E3)

| Invariant | Unit test (M1) | Integration test (root) |
|-----------|----------------|--------------------------|
| INV-1 exclude independence | ✅ `selectorResolution::Fixture A` | ✅ `DeployIncludeExclude::… NOT registered with Exclude` |
| INV-2 include override | ✅ `selectorResolution::Fixture B` | ✅ `DeployIncludeExclude::facetAddress ownership` + `DeployAdditive` |
| INV-3 include additive | ✅ `selectorResolution::INV-3 additivity` | ✅ `DeployAdditive::INV-3 additivity` |
| INV-4 single owner / clean cut on upgrade | ✅ `selectorResolutionUpgrade::S-1…S-4` | ✅ `DeployIncludeExclude::facetFunctionSelectors/facetAddress` |
| INV-5 no schema change / legacy both-sides | ⚠️ implicit (schema unchanged) | ⚠️ implicit — **minor gap** (no dedicated legacy-both-sides test) |
| INV-6 absence when unclaimed | ✅ `selectorResolution::Fixture A` | ✅ `DeployIncludeExclude::owned by NO facet — absent (INV-6)` |
| INV-7 both-lists-one-facet (**hard error**) | _deferred → validator (DR-3)_ | `DeployIncludeExclude::INV-7 … deferred to validator` (pending) |
| INV-8 dual include (**hard error**) | _deferred → validator (DR-3)_ | — (deferred) |
| INV-9 non-existent selector no-op | ✅ `selectorResolution::INV-9 no-op` | ✅ `DeployIncludeExclude::non-existent exclude/include` |

> Full citations + cross-strategy + sign-off: [Milestone-04/traceability-matrix.md](Milestone-04/traceability-matrix.md).

## 12. Next step — breaking this out

The tree is already broken out through M0 (overview + 3 epic overviews + 3 PRDs + the M0-E2 task list).
After the **M0-E1 oracle ratification** (incorporating this reframe), continue:

```
packages/diamonds/project/deployinclude-exclude-fix/
├── deployinclude-exclude-fix-project-plan.md      ← this file (reframed)
├── deployinclude-exclude-fix-architecture.md      ← the TDD oracle (reframed; read first)
├── Milestone-00/                                   ← M0 (broken out)
│   ├── overview/ milestone-01-oracle-and-red-baseline.md
│   ├── Epic-01/ {overview/e1-…, prd-e1-…}          ← oracle ratification gate
│   ├── Epic-02/ {overview/e2-…, prd-e2-…, tasks-e2-…}  ← baseline (done; reframed)
│   └── Epic-03/ {overview/e3-…, prd-e3-…}          ← test audit
├── Milestone-01/  …   ← M1 testable-resolution-core
├── Milestone-02/  …   ← M2 additivity-and-test-correctness
├── Milestone-03/  …   ← M3 upgrade-path-and-dead-code-hardening
└── Milestone-04/  …   ← M4 regression-and-signoff
```

Pipeline: `/breakout-milestone` → `/breakout-epics` → `/create-prd` → `/generate-tasks` →
`/process-task-list`. **Next action:** ratify the reframed oracle (M0-E1), then break out M1.
