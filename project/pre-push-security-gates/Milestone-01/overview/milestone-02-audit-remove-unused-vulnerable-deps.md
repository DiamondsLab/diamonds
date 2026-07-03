# Milestone 2 — Audit Gate: Remove Unused Vulnerable Deps (M1)

> **Maps to:** [`pre-push-security-gates-project-plan.md`](../../pre-push-security-gates-project-plan.md) §5 → **M1** (and Milestone map row M1). No architecture doc for this project.
> **Status:** 📋 planned · **Impact:** Low-Med — removes two unused direct deps; no code/breaking-change path, but touches `package.json` + lockfile · **Author:** Engineer (with Claude) · **Date:** 2026-07-03
> **Epic breakouts:** [`e1-confirm-unused-enumerate`](../Epic-01/overview/e1-confirm-unused-enumerate.md) · [`e2-remove-unused-deps`](../Epic-02/overview/e2-remove-unused-deps.md) · [`e3-residual-verify`](../Epic-03/overview/e3-residual-verify.md) *(links resolve once `/breakout-epics` runs)*

## 1. Why this milestone exists

`npm audit` is the first **blocking** pre-push gate, and the M0 baseline showed it is failing on **26 advisories — 13 high + 13 moderate** (not the "2 lodash" the plan originally assumed; that was a truncated-output artifact). The root cause is narrow and lucky: `axios` (`1.12.2`, ~23 advisories) and `lodash` (`4.17.21`, ~3) are both direct `dependencies` with **zero imports** across `src`/`scripts`/`test` — **unused**. So clearing the audit gate is *dependency hygiene* (remove two unused deps), not a risky `axios` major upgrade. M1 sits second on the critical path (`M0 → M1 → M2 → M3 → M4`); the final unbypassed push (M4) can't happen until this gate is green.

## 2. Goal & exit criteria

**Goal:** Take `yarn npm audit --severity moderate` to **0 findings** by removing the unused `axios` + `lodash` direct dependencies, and resolving or documenting any residual (transitive) advisory.

**Exit criteria:**
- [ ] `axios` and `lodash` confirmed unused everywhere (src/scripts/test/config), then **removed** from `package.json` `dependencies`; lockfile regenerated.
- [ ] `yarn npm audit --severity moderate` → **0 findings** (or: every remaining advisory has a documented `resolutions`/upgrade fix **or** an owner-signed accepted-risk).
- [ ] `yarn build` + submodule `yarn test` (`51/0`) still green after removal.
- [ ] Any residual **transitive** advisory (not cleared by direct removal) is enumerated and dispositioned.

## 3. Scope

**In scope**
- Removing the unused `axios` + `lodash` direct dependencies from `packages/diamonds/package.json`.
- Regenerating the diamonds lockfile and re-running audit/build/tests.
- Triaging + dispositioning any **residual** advisory that survives direct removal (transitive path): upgrade, `resolutions`, or documented accepted-risk (owner sign-off).

**Out of scope (deferred)**
- semgrep / slither / hook changes (M2/M3/M4).
- Replacing axios/lodash functionality (they're unused — nothing to replace).
- Upgrading *used* dependencies for non-security reasons.
- The pre-existing unrelated `yarn.lock` working-tree diff (excluded from commits).

## 4. Roles on this milestone

| Who | Does what |
|-----|-----------|
| **Engineer** (agent) | Confirm unused, remove the deps, regenerate lock, re-audit, verify build/tests, enumerate residuals. |
| **Owner** | **Conditional blocking gate (OP-M1-1):** *only if* a residual advisory has no clean fix — sign off on the documented accepted-risk (or direct an upgrade/`resolutions`). If direct removal clears all 26, no owner action is needed. |

## 5. Epics

| Epic | Title | Owner | Impact | Breakout |
|------|-------|-------|--------|----------|
| M1-E1 | Confirm unused + enumerate | Engineer | Ref | [`e1-confirm-unused-enumerate`](../Epic-01/overview/e1-confirm-unused-enumerate.md) |
| M1-E2 | Remove unused deps | Engineer | Small | [`e2-remove-unused-deps`](../Epic-02/overview/e2-remove-unused-deps.md) |
| M1-E3 | Residual + verify | Engineer (+ Owner, conditional) | Small-Med | [`e3-residual-verify`](../Epic-03/overview/e3-residual-verify.md) |

**M1-E1 — Confirm unused + enumerate.** Re-confirm `axios` + `lodash` have 0 imports anywhere (baseline: src/scripts/test = 0; also check configs, dynamic `require`, and re-exports from the package barrel/`index`). From `baseline.md`, list all 26 advisories by package/severity, and — critically — determine for each whether the vulnerable package is reached **only via the direct axios/lodash declaration** (clears on removal) or **also transitively** via another dependency (won't clear). Acceptance shape: a short table of `advisory → package → direct/transitive → clears-on-removal?`. Key risk: a dynamic/re-export usage the grep missed — check the barrel + `exports`.

**M1-E2 — Remove unused deps.** Remove `axios` and `lodash` from `packages/diamonds/package.json` `dependencies`; regenerate the lockfile (standalone `yarn install` inside `packages/diamonds`, per the monorepo-wiring gotcha); re-run `yarn npm audit --severity moderate` to measure how many advisories cleared. Acceptance shape: deps gone, lock regenerated, audit count dropped (ideally to 0). Key risk: the monorepo/devcontainer install churn (yarn state bug / hoisting) — install inside the submodule, not the root; keep the pre-existing unrelated `yarn.lock` diff out of the commit.

**M1-E3 — Residual + verify.** For any advisory still present after E2 (transitive), disposition it: bump/`resolutions` the transitive dependent if a clean version exists, else document an **accepted-risk** with **owner sign-off (OP-M1-1)**. Then verify the gate + regressions: `yarn npm audit --severity moderate` → 0 (or all-dispositioned), `yarn build` green, submodule `yarn test` still `51/0`. Acceptance shape: audit gate green/dispositioned + build/tests green, recorded in `baseline.md` + CHANGELOG. Key risk: a `resolutions` override breaks a real consumer — re-run build/tests after any override.

## 6. Dependencies & sequencing

- **Upstream:** M0 (baseline + reliable audit invocation) — done.
- **Internal ordering:** M1-E1 (confirm/enumerate) → M1-E2 (remove) → M1-E3 (residual + verify). E3's owner gate only fires if E2 leaves residual advisories.
- **Owner gates:** **OP-M1-1** (conditional) — accepted-risk sign-off for any unfixable residual advisory.
- **Downstream:** M4 (the unbypassed push needs this gate green). M2/M3 are independent and can proceed in parallel, but the plan sequences audit first (cheapest, clearest).

## 7. Rollback posture

Single, clean lever: **revert the `package.json` + lockfile commit** (restores `axios` + `lodash`). No source code changes, so nothing else to undo. Any `resolutions` override added in E3 is part of the same revert. Build/tests are re-run after removal, so a regression is caught before the gate is called green.

## 8. Risks (milestone-scoped)

| Risk | Mitigation |
|------|------------|
| axios/lodash used via a path the grep missed (dynamic `require`, barrel re-export, config) | M1-E1 explicitly checks configs + the package `exports`/barrel + dynamic requires before removal; build+tests confirm |
| An advisory is transitive and doesn't clear on direct removal | M1-E1 flags direct-vs-transitive per advisory; M1-E3 upgrades/`resolutions` or documents accepted-risk (owner) |
| Regenerating the lock churns the devcontainer install (yarn state bug / hoisting) | Install **inside** `packages/diamonds` (standalone), not the root; keep the unrelated pre-existing `yarn.lock` diff out of the commit |
| A downstream consumer of published `@diamondslab/diamonds` relied on axios/lodash as transitive | Low — diamonds imports neither, so it isn't re-exporting them; note in M1-E1, surface if the barrel re-exports them |
| `resolutions` override (E3) breaks a real dependency | Re-run `yarn build` + `yarn test` after any override; revert if red |

## 9. Definition of Done for Milestone 2 (M1)

M1 is closeable when:
- `axios` + `lodash` are removed from `dependencies`, lockfile regenerated, and confirmed unused.
- `yarn npm audit --severity moderate` → **0 findings**, or every residual advisory has a documented fix or an **owner-signed** accepted-risk.
- `yarn build` + submodule `yarn test` (`51/0`) still green.
- The audit result + any dispositions are recorded in `baseline.md` and the epic CHANGELOGs.
