# Milestone 3 — Semgrep Gate: Triage & Disposition (M2)

> **Maps to:** [`pre-push-security-gates-project-plan.md`](../../pre-push-security-gates-project-plan.md) §5 → **M2** (and Milestone map row M2). No architecture doc for this project.
> **Status:** 📋 planned · **Impact:** Low-Med — touches one CLI source file and possibly `.semgrep.yml`; no runtime behavior change · **Author:** Engineer (with Claude) · **Date:** 2026-07-03
> **Epic breakouts:** [`e1-enumerate-classify`](../Epic-01/overview/e1-enumerate-classify.md) · [`e2-disposition-gate-green`](../Epic-02/overview/e2-disposition-gate-green.md) *(links resolve once `/breakout-epics` runs)*

## 1. Why this milestone exists

`semgrep` is the second blocking pre-push gate (after audit, now green). The M0 baseline pinned the failure precisely: **10 findings, all the single rule `typescript-any-usage`, all in one product file — `src/cli/diamond-abi-cli.ts` (lines 348–479).** There are **no** Solidity-security-rule findings (the plan originally speculated those; the baseline disproved it), so this milestone is narrow: dispose of 10 `any` usages in one CLI file to take `yarn semgrep:scan` to 0 blocking. Third on the critical path (`M0 → M1 → M2 → M3 → M4`); the final unbypassed push (M4) needs this gate green.

## 2. Goal & exit criteria

**Goal:** Take `yarn semgrep:scan` (`semgrep scan --config .semgrep.yml --exclude-rule weak-encryption --error`) to **0 blocking findings**, with each of the 10 `typescript-any-usage` findings dispositioned (fixed, annotated, or the rule tuned) and the choice documented.

**Exit criteria:**
- [ ] `yarn semgrep:scan` → **0 blocking findings** (exit 0).
- [ ] Each of the 10 findings has a recorded disposition: a real type applied, an inline `// nosemgrep: typescript-any-usage` with a written reason, or the rule tuned in `.semgrep.yml` (with justification).
- [ ] `yarn build` + submodule `test:unit` still green after any code change (no regression).
- [ ] The disposition approach + result recorded in `baseline.md` + CHANGELOGs.

## 3. Scope

**In scope**
- The 10 `typescript-any-usage` findings in `src/cli/diamond-abi-cli.ts` — triage + disposition (fix / annotate / tune).
- Possibly editing `.semgrep.yml` (tuning the `typescript-any-usage` rule) if that's the chosen disposition.

**Out of scope (deferred)**
- The Solidity-security rules in `.semgrep.yml` — they currently produce **no** findings; leave them as-is (they'd be handled via the M0 fixtures-scoping mechanism only if they ever fire).
- audit / slither / hook changes (M1 done, M3/M4 later).
- Broad refactors of `diamond-abi-cli.ts` beyond the flagged `any` usages.

## 4. Roles on this milestone

| Who | Does what |
|-----|-----------|
| **Engineer** (agent) | Enumerate + classify the 10 findings, apply the chosen disposition, verify the gate + no regression. |
| **Owner** | **Decision (not a blocking provisioning gate):** choose the disposition posture — *fix the `any`s with real types* vs *annotate `nosemgrep`* vs *tune the rule* (or a mix). Surfaced at M2-E1 / `/create-prd`. No credentials/outward-facing action. |

## 5. Epics

| Epic | Title | Owner | Impact | Breakout |
|------|-------|-------|--------|----------|
| M2-E1 | Enumerate & classify | Engineer | Ref | [`e1-enumerate-classify`](../Epic-01/overview/e1-enumerate-classify.md) |
| M2-E2 | Disposition → gate green | Engineer | Med | [`e2-disposition-gate-green`](../Epic-02/overview/e2-disposition-gate-green.md) |

**M2-E1 — Enumerate & classify.** Read the 10 flagged sites in `src/cli/diamond-abi-cli.ts` (lines 348, 350, 355, 359, 375, 394, 474, 477, 478, 479) and classify each: is a **real, specific type** readily available (fixable), or is the `any` **justified** (e.g. genuinely dynamic CLI arg/JSON parsing where a precise type adds little)? Then frame the **disposition decision** — fix-all vs annotate-all vs tune-the-rule vs mix — for owner sign-off. Acceptance shape: a per-finding table (`line | context | fixable? | proposed disposition`) + a recommended posture. Read-only. Key risk: mis-classifying a fixable `any` as justified — err toward a real type where cheap.

**M2-E2 — Disposition → gate green.** Apply the chosen disposition: replace fixable `any`s with proper types; add inline `// nosemgrep: typescript-any-usage` (with a one-line reason) for justified ones; and/or tune the `typescript-any-usage` rule in `.semgrep.yml` (e.g. scope it, downgrade to non-blocking, or exclude the CLI) if that's the decision — documenting why. Re-run `yarn semgrep:scan` to **0 blocking**, then `yarn build` + `test:unit` to confirm no regression. Acceptance shape: gate green + build/tests green + dispositions recorded. Key risk: a type fix changes behavior → re-run build+tests; keep edits minimal and type-only.

## 6. Dependencies & sequencing

- **Upstream:** M0 (baseline enumeration + reliable `semgrep` invocation) — done. Independent of M1.
- **Internal ordering:** M2-E1 (classify + decide) → M2-E2 (apply + verify).
- **Owner gates:** none blocking; one **decision** (disposition posture) surfaced at M2-E1/create-prd.
- **Downstream:** M4 (the unbypassed push needs this gate green).

## 7. Rollback posture

If M2-E2 edits `src/cli/diamond-abi-cli.ts` and/or `.semgrep.yml`: **revert those commits** — a single, clean lever. No dependency or runtime change. Build + tests are re-run after edits, so a regression is caught before the gate is called green.

## 8. Risks (milestone-scoped)

| Risk | Mitigation |
|------|------------|
| Tuning the rule away hides a *real* `any` problem elsewhere later | Prefer fixing/annotating specific sites over disabling the rule wholesale; if tuning, scope narrowly + document |
| A type fix subtly changes CLI behavior | Keep edits type-only + minimal; re-run `yarn build` + `test:unit`; the CLI's tests (if any) guard it |
| Annotating every finding is "suppress to pass" optics | Each `nosemgrep` carries a written reason; the owner picks the posture (fix vs annotate vs tune) |

## 9. Definition of Done for Milestone 3 (M2)

M2 is closeable when:
- `yarn semgrep:scan` → 0 blocking findings.
- All 10 findings dispositioned with a recorded choice (fix / annotate / tune + reasons).
- `yarn build` + submodule `test:unit` still green.
- Disposition + result recorded in `baseline.md` + the epic CHANGELOGs.
