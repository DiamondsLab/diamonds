# Milestone 4 — Decommission Slither (M3)

> **Maps to:** [`pre-push-security-gates-project-plan.md`](../../pre-push-security-gates-project-plan.md) §5 → **M3** (and Milestone map row M3). No architecture doc for this project.
> **Status:** 📋 planned · **Impact:** Low — removes a blocking gate + edits `.husky/pre-push` + `package.json`; no source/runtime change · **Author:** Engineer (with Claude) · **Date:** 2026-07-04
> **Epic breakouts:** [`e1-remove-slither-gate`](../Epic-01/overview/e1-remove-slither-gate.md) *(link resolves once `/breakout-epics` runs)*

## 1. Why this milestone exists

Slither is the third blocking pre-push gate, and it's the one that doesn't belong here. The owner already decided (project setup, option "3D"): **diamonds is a TypeScript tool, not a smart-contract product** — the in-repo Solidity contracts exist only as test fixtures, so a contract static-analyzer is not an appropriate *release gate* for this repo. The M0 baseline reinforced it: `yarn slither:scan` **errors in-container** (crytic-compile `KeyError: 'output'`) — it can't even run. This milestone removes slither as a blocking gate and documents why. Fourth on the critical path (`M0 → M1 → M2 → M3 → M4`); with audit + semgrep already green and git-secrets clean, removing slither leaves only the hook redesign (M4) before the unbypassed push.

## 2. Goal & exit criteria

**Goal:** Remove slither from every **blocking** path (the pre-push hook + the `security-check` aggregate), with a documented rationale — so slither no longer fails the gate.

**Exit criteria:**
- [ ] The slither step is removed from `.husky/pre-push` (lines ~44–49).
- [ ] `yarn slither:scan` is removed from the `security-check` aggregate script (`package.json`).
- [ ] The decommission rationale is documented in-repo (tooling repo; contracts are fixtures; cites the M0 tooling-repo rationale + the in-container error).
- [ ] The fate of `slither:scan`/`slither:check` scripts + `slither.config.json` is decided (keep as optional-manual **or** remove) and applied.
- [ ] `.husky/pre-push` no longer references slither; no CI references it (none exists).

## 3. Scope

**In scope**
- Removing the slither block from `.husky/pre-push`.
- Removing `yarn slither:scan` from `security-check` in `package.json`.
- Deciding + applying the fate of the `slither:scan`/`slither:check` scripts + `slither.config.json`.
- Writing the decommission rationale (in `baseline.md` / a repo doc).

**Out of scope (deferred)**
- The broader hook redesign (lean/resilient, tests off the gate) — that's M4. M3 only *removes slither*; M4 restructures what remains.
- audit/semgrep (done).
- Adding contract analysis back / any real-contract security work.

## 4. Roles on this milestone

| Who | Does what |
|-----|-----------|
| **Engineer** (agent) | Remove slither from the hook + `security-check`, apply the scripts/config decision, document the rationale, verify no slither reference remains in a blocking path. |
| **Owner** | **Decision (not a blocking provisioning gate):** keep the `slither:*` scripts + `slither.config.json` as *optional-manual* tools, or remove them entirely. Surfaced at M3-E1 / `/create-prd`. The removal itself is already owner-approved (3D). |

## 5. Epics

| Epic | Title | Owner | Impact | Breakout |
|------|-------|-------|--------|----------|
| M3-E1 | Remove slither gate + document | Engineer | Low | [`e1-remove-slither-gate`](../Epic-01/overview/e1-remove-slither-gate.md) |

**M3-E1 — Remove slither gate + document.** Delete the slither block from `.husky/pre-push` (the `echo "🐍 …"` + `if ! yarn slither:scan …` that sets `success=false`); remove `yarn slither:scan &&` from the `security-check` aggregate in `package.json`. Apply the owner's decision on the `slither:scan`/`slither:check` scripts + `slither.config.json` (keep-as-manual = leave the scripts + config but out of any gate; remove = delete them). Write the decommission rationale (diamonds is a TS tool; contracts are fixtures; slither errors in-container — cite M0). Verify: `grep slither .husky/` returns nothing; `security-check` no longer runs slither. Acceptance shape: no slither in any blocking path + rationale recorded. Reversible via git. Key risk: leaving a dangling slither reference in a blocking path — grep to confirm.

## 6. Dependencies & sequencing

- **Upstream:** M0 (baseline: slither errors in-container — the evidence). Independent of M1/M2.
- **Internal ordering:** single epic.
- **Owner gates:** none blocking (removal pre-approved). One **decision**: scripts/config fate (surfaced at create-prd).
- **Downstream:** M4 (the hook redesign builds on the slither-free `.husky/pre-push`; the unbypassed push needs slither gone).

## 7. Rollback posture

Single clean lever: **revert the `.husky/pre-push` + `package.json` (+ any config) commit** — restores the slither gate. No source/runtime change, so nothing else to undo.

## 8. Risks (milestone-scoped)

| Risk | Mitigation |
|------|------------|
| A dangling slither reference remains in a blocking path | `grep -rn slither .husky/ package.json` after the edit → confirm none in a *blocking* path (scripts kept as manual are fine) |
| Removing slither reads as "dropping security" | Documented rationale (tooling repo; fixtures; errors in-container); audit + semgrep stay enforced |
| Deleting `slither.config.json`/scripts loses future utility | Owner picks keep-as-manual vs remove; keep-as-manual preserves the option at zero gate cost |

## 9. Definition of Done for Milestone 4 (M3)

M3 is closeable when:
- Slither is gone from `.husky/pre-push` and from the `security-check` aggregate.
- The scripts/config decision is applied.
- The decommission rationale is documented.
- `grep slither .husky/` is empty; the pre-push hook no longer blocks on slither.
