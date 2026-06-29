# Change Plan (PRD) — M0-E3 Test-Audit Matrix

> **Epic overview:** [e3-test-audit-matrix.md](overview/e3-test-audit-matrix.md) · **Parent milestone:** [Milestone 1 (M0)](../overview/milestone-01-oracle-and-red-baseline.md) · **Project plan:** [deployinclude-exclude-fix-project-plan.md](../../deployinclude-exclude-fix-project-plan.md) · **Oracle:** [architecture](../../deployinclude-exclude-fix-architecture.md)
> **Status:** 📋 ready for `/generate-tasks` · **Owner:** Engineer (agent-assisted) · **Date:** 2026-06-27

## 1. Overview & Problem
Some existing assertions **pass vacuously** rather than asserting the intended design — most plainly
`test/deployment/DeployIncludeExclude.test.ts:142-164`, whose `if (registry.has('0xdc38f9ab'))` guard is
**false** at HEAD (the excluded selector is correctly absent), so its inner assertion never runs and the
test proves nothing. Others leave the approved **additive** semantics (INV-3), **absence** (INV-6), and
the **upgrade/redeploy path** untested. **Goal:** produce a complete matrix classifying every assertion
against the frozen oracle as **keep / correct (rewrite) / add**, so M1 knows what to write and M2/M3 know
exactly what to fix — and nothing "passes" by asserting the wrong thing (or nothing at all).

## 2. Goals
- 100% coverage: every `it()` in both suites inventoried, classified, and bound to an invariant (INV-1…9).
- Every **correct** row names the precise rewrite (file:line → target oracle assertion), explicitly
  flagging **vacuous passes** (guard-false/empty assertions that prove nothing).
- Every coverage gap named — minimally **INV-3 additivity**, **INV-6 absence**, and the
  **upgrade/redeploy path** — with its remedy.
- An explicit **"add" list** that becomes the input to M1-E2/M1-E3 and M4 edge-case work.

## 3. Scope — Components & Services
- **Analyzed (read-only):** `test/deployment/DeployIncludeExclude.test.ts`,
  `test/deployment/SelectorRegistration.test.ts`.
- **Reference fixtures (for "current assertion" context):** the include/exclude configs and the
  `test-assets/test-diamonds/*` edge configs.
- **Artifact written:** `Milestone-00/test-audit-matrix.md` (new file; no test/source edits).

## 4. Stakeholders & Impact
- **Affected:** downstream epics (M1-E2/E3, M2-E2, M3, M4-E3) consume this matrix.
- **User-facing / production impact:** none — static analysis producing a planning artifact.

## 5. Operational Requirements
1. Every `describe`/`it` in both suites MUST be inventoried; no `it()` omitted.
2. Each assertion MUST be classified **keep** (already asserts the oracle), **correct** (a vacuous pass
   or bug-encoding assertion → rewrite), or **add** (oracle rule with no current test).
3. Each row MUST bind to an invariant; any assertion that **cannot** be bound MUST be logged as a
   finding (it may be testing the wrong thing, or asserting nothing) rather than silently kept.
4. The matrix MUST explicitly flag `DeployIncludeExclude.test.ts:142-164` as **correct** → rewrite to
   assert INV-6 absence **directly** (its `if (registry.has('0xdc38f9ab'))` guard is false at HEAD, so it
   asserts nothing; rewrite to assert no facet owns `0xdc38f9ab` under the exclude config).
5. Coverage gaps MUST be named: at minimum INV-3 (additivity — Fixtures A & B can't distinguish additive
   from whitelist), INV-6 (absence), and the **upgrade/redeploy path** (no deploy-then-upgrade test);
   note whether INV-8 (dual-include) has any home in the suite.
6. The artifact's columns MUST be authored so M4-E3's invariant↔test traceability table can slot in
   directly (`suite · it() · current assertion · classification · target oracle · invariant`).
7. No test or source file may be edited in this epic — corrections are *planned* here, *applied* in
   M2/M3.

## 6. Security & Compliance Considerations
- None. Static reading of test files producing a markdown artifact; no secrets, no privileged actions,
  no production resources. **No human-approval gate** applies.

## 7. Non-Goals (Out of Scope)
- Applying any correction or writing any new test (M1/M2/M3).
- Building Fixture C (M1-E3) — this epic only mandates it.
- Auditing suites beyond the two named (broader regression is M4-E2).

## 8. Risk, Rollback & Recovery
- **Risk:** a subtly vacuous or bug-encoding assertion is mis-filed as "keep." **Mitigation:** every row
  must bind to an invariant; an assertion that passes today but asserts nothing (guard-false/empty) or
  can't be justified by the oracle is a **correct**.
- **Risk:** classification drifts if OP-1 amends an invariant. **Mitigation:** mark the matrix
  "provisional pending OP-1" and reconcile after the freeze.
- **Rollback:** delete the artifact; nothing else touched. **No backup required** (read-only).

## 9. Validation / Success Metrics
- `Milestone-00/test-audit-matrix.md` committed, with every `it()` present, classified, and
  invariant-bound; the L142-164 vacuous-pass rewrite explicitly listed; the INV-3 / INV-6 / upgrade-path
  gaps and the "add" list present.
- Spot-check: pick any 3 rows at random — each has a defensible classification traceable to a named
  invariant.

## 10. Open Questions
- Should the matrix be run **after** M0-E2 so the "current assertion" column can also note *observed*
  pass/fail? (Recommended: yes — pairs cleanly with the baseline, but source-only classification can
  proceed if E2 is delayed.)
- INV-8 likely has **no** current test home; confirm whether to log it purely as an "add" for a later
  milestone (it is not exercised by the existing fixtures).
