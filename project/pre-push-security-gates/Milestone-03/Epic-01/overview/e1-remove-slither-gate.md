# Epic 1 — Remove Slither Gate + Document (M3-E1)

> **Parent milestone:** [Milestone 4 — Decommission Slither (M3)](../../overview/milestone-04-decommission-slither.md) · **Maps to:** [`pre-push-security-gates-project-plan.md`](../../../pre-push-security-gates-project-plan.md) §5 M3 → M3-E1
> **Owner:** Engineer (+ Owner decision on scripts/config fate) · **Impact/blast radius:** `.husky/pre-push` + `package.json` (+ maybe `slither.config.json`); no source/runtime change · **Estimated effort:** S · **Status:** 📋 planned

## 1. Objective
Remove slither from every **blocking** path so it stops failing the pre-push gate, and document why (diamonds is a TS tool; in-repo contracts are test fixtures; slither also *errors in-container* per the M0 baseline). Concretely: delete the slither block from `.husky/pre-push`, drop `yarn slither:scan` from the `security-check` aggregate, and apply the owner's decision on the `slither:scan`/`slither:check` scripts + `slither.config.json` (keep-as-manual vs remove).

## 2. Acceptance criteria
- [ ] The slither block removed from `.husky/pre-push` (the `echo "🐍 …"` + `if ! yarn slither:scan … success=false` at ~lines 44–49).
- [ ] `yarn slither:scan &&` removed from the `security-check` script in `package.json` (line ~99).
- [ ] Owner's scripts/config decision applied: **keep-as-manual** (leave `slither:scan`/`slither:check` + `slither.config.json`, just out of every gate) **or** **remove** (delete the two scripts + `slither.config.json`).
- [ ] Decommission rationale documented (in `baseline.md` or a repo doc): tooling repo; contracts are fixtures; cites M0's in-container slither error.
- [ ] `grep -rn slither .husky/` returns **nothing**; `security-check` no longer runs slither; no CI references it (none exists).

## 3. Tasks
| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | Remove the slither block from `.husky/pre-push` (lines ~44–49) | Engineer | block gone; `grep slither .husky/` empty |
| 2 | Remove `yarn slither:scan &&` from the `security-check` aggregate in `package.json` | Engineer | script no longer runs slither |
| 3 | Apply the owner's scripts/config decision (keep-as-manual **or** remove `slither:scan`/`slither:check` + `slither.config.json`) | Engineer + **Owner (decision)** | decision applied |
| 4 | Document the decommission rationale in `baseline.md` (cite M0 tooling-repo rationale + the in-container error) | Engineer | rationale recorded |
| 5 | Verify no slither reference remains in any blocking path | Engineer | grep confirms |

## 4. Dependencies & owner gates
- **Upstream:** M0 (baseline: slither errors in-container). Independent of M1/M2.
- **Owner gates:** removal is **pre-approved** (project setup "3D"). One **decision** to surface at `/create-prd`: keep the `slither:*` scripts + `slither.config.json` as optional-manual, or remove them. Not a credential/provisioning gate.
- **Downstream:** M4 (the hook redesign builds on the slither-free `.husky/pre-push`).

## 5. Risks
| Risk | Mitigation |
|------|------------|
| A dangling slither reference remains in a blocking path | `grep -rn slither .husky/ package.json` after edits; scripts kept as manual are fine, but nothing in a *gate* |
| Removing slither reads as dropping security | Documented rationale; audit + semgrep stay enforced; slither couldn't even run in-container |
| Deleting config/scripts loses future utility | Owner picks keep-as-manual (zero gate cost) vs remove |

## 6. Notes
- Reversible: revert the `.husky/pre-push` + `package.json` (+ config) commit.
- No source or runtime change — this is hook + package.json (+ maybe a config-file delete).
- Leaves only M4 (lean hook + tests-off + unbypassed push) before the pre-push gate passes end-to-end.
