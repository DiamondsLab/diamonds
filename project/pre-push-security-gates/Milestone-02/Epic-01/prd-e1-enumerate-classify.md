# Change Plan (PRD) — M2-E1 Enumerate & Classify

> **Expands:** [`overview/e1-enumerate-classify.md`](overview/e1-enumerate-classify.md) · **Parent:** [Milestone 3 (M2)](../overview/milestone-03-semgrep-triage-disposition.md) · **Plan:** [`pre-push-security-gates-project-plan.md`](../../pre-push-security-gates-project-plan.md)
> **Type:** read-only analysis · **Status:** 📋 ready for `/generate-tasks` · **Date:** 2026-07-03

## 1. Overview & Problem
The semgrep gate fails on 10 `typescript-any-usage` findings, all in `src/cli/diamond-abi-cli.ts`. Before changing anything, classify each `any`: is a real type cheaply available (→ fix), or is it justified (dynamic CLI/JSON → annotate/tune)? **Goal:** produce a per-finding classification + a recommended disposition posture (fix / annotate / tune) for owner decision — read-only, no code change.

## 2. Goals
- G1 — A per-finding table for all 10 sites: `line | what the `any` is | fixable? | proposed disposition`.
- G2 — A **recommended posture** (fix-all / annotate-all / tune-the-rule / mix) with a one-line rationale, for owner sign-off before M2-E2.
- G3 — Recorded in `baseline.md` (M2 section).

## 3. Scope — Components & Services
- **Repo:** `packages/diamonds/` only.
- **Read:** `src/cli/diamond-abi-cli.ts` (lines 348, 350, 355, 359, 375, 394, 474, 477, 478, 479 + surrounding context); `.semgrep.yml` (`typescript-any-usage` rule).
- **Written:** `baseline.md` (M2 classification section).

## 4. Stakeholders & Impact
- **Engineer (agent):** executes. **Owner:** decides the disposition posture (after this epic). **User-facing/production impact:** none — read-only analysis; `diamond-abi-cli.ts` is a dev/CLI tool, not runtime app code.

## 5. Operational Requirements
1. Read each flagged line + its surrounding context; record what the `any` represents.
2. Classify each as **fixable-with-a-real-type** or **justified-any**.
3. Propose a per-finding disposition (fix / `// nosemgrep: typescript-any-usage` / rule-tune) + a recommended overall posture.
4. Record the table + recommendation in `baseline.md`.
5. Make **no** code or config change.

## 6. Security & Compliance Considerations
- Read-only; no secrets/credentials/elevated privileges. `typescript-any-usage` is a code-quality rule, not a secret detector — no sensitive content involved.

## 7. Non-Goals (Out of Scope)
- **Applying** any disposition (M2-E2).
- Broad refactors of the CLI beyond the flagged `any` usages.
- The Solidity-security rules (no findings; untouched).

## 8. Risk, Rollback & Recovery
- **Backup/snapshot required:** no — read-only.
- **Risk:** mis-classifying a fixable `any` as justified → **Mitigation:** err toward a real type where cheap; mark justified only for genuinely dynamic values.
- **Rollback:** revert the `baseline.md` edit (documentation only).

## 9. Validation / Success Metrics
- `baseline.md` M2 section has all 10 findings classified + a recommended posture.
- `git status` shows only `baseline.md` (+ epic docs) changed.

## 10. Open Questions
- The disposition posture (fix vs annotate vs tune) is the **owner's** decision — surfaced after this epic with the classification data, before M2-E2. This PRD only *recommends*.

**Next:** `/generate-tasks` against this PRD.
