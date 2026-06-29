# Change Plan (PRD) — M0-E1 Selector-Resolution Spec (Oracle Ratification)

> **Epic overview:** [e1-selector-resolution-spec.md](overview/e1-selector-resolution-spec.md) · **Parent milestone:** [Milestone 1 (M0)](../overview/milestone-01-oracle-and-red-baseline.md) · **Project plan:** [deployinclude-exclude-fix-project-plan.md](../../deployinclude-exclude-fix-project-plan.md) · **Reframed oracle under review:** [architecture](../../deployinclude-exclude-fix-architecture.md)
> **Status:** 📋 ready for `/generate-tasks` · **Owner:** Owner (Am0rfu5) · **Date:** 2026-06-27

## 1. Overview & Problem
TDD is only as reliable as its oracle. The selector-resolution semantics exist in **draft**, now
**reframed** (the architecture doc's §1 banner records the verified **green-at-HEAD** state — this is a
**design-hardening** oracle, not a red-test fix) — resolution algorithm, INV-1…9, §4 truth table,
Fixture C. Two of those invariants — **INV-7** and **INV-8** — are defaults the agent authored but the
Owner never confirmed. **Goal:** the Owner reviews the **reframed** draft against the M0-E2 **green**
baseline ([baseline.md](../baseline.md)) and M0-E3 audit, ratifies INV-7/INV-8 (confirm or amend),
and **freezes** the oracle. This is the project's single blocking gate (**OP-1**); M1–M4 cannot start
until it clears.

## 2. Goals
- A **frozen** oracle doc whose invariants are internally consistent with the §4 truth table.
- **INV-7** decided: same-facet selector in both `deployInclude` and `deployExclude` (draft = exclude
  wins + warning).
- **INV-8** decided: two facets force-including the same selector (draft = highest-priority includer
  wins + warning).
- Fixture C (additivity discriminator) specified concretely enough for M1-E3 to build with no further
  design input.

## 3. Scope — Components & Services
- **Document only:** `deployinclude-exclude-fix-architecture.md` (the oracle) — add a freeze marker +
  decision-log entry; incorporate any Owner-requested refinements.
- **Decisions ratified:** INV-7, INV-8 (and any invariant the baseline/audit shows needs amendment).
- **No code, test, schema, or fixture** is in scope.

## 4. Stakeholders & Impact
- **Affected:** every downstream epic asserts this oracle — M1 (RED tests), M2/M3 (corrections + fixes),
  M4 (sign-off). A late change here ripples widely, which is exactly why it is gated first.
- **User-facing / production impact:** none (a design decision + doc edit).

## 5. Operational Requirements
1. The review SHOULD occur **after** M0-E2 (baseline) and M0-E3 (audit) so ratification is
   evidence-based, not assumed.
2. The Owner MUST explicitly decide **INV-7** and record the outcome in the doc's decision log.
3. The Owner MUST explicitly decide **INV-8** and record the outcome in the doc's decision log.
4. Any Owner-requested refinement MUST be incorporated, and the §4 truth table MUST be re-verified
   against the final invariant set (no dangling contradiction).
5. Fixture C MUST be confirmed buildable (config shape, which facet, expected owners) so M1-E3 is
   unblocked.
6. The architecture doc MUST carry a **freeze marker** (status "ratified/frozen" + date) and a one-line
   decision-log entry; the gate being clear MUST be announced so M1 may begin.

## 6. Security & Compliance Considerations
- No secrets, credentials, or production resources. The only "privileged" element is **design
  authority**: ratification is **owner-only** and MUST NOT be self-approved by the agent. The agent may
  draft, propose, and incorporate edits; the Owner alone clears OP-1.

## 7. Non-Goals (Out of Scope)
- Writing or changing any test or source code (M1+).
- Building Fixture C or any fixture (M1-E3).
- Implementing the broader `basestrategy-fulfillment` convergent redesign — this oracle is a compatible
  subset only.

## 8. Risk, Rollback & Recovery
- **Risk:** Owner flips INV-7/INV-8 *after* M1 tests exist → rework. **Mitigation:** force both decisions
  here, before any test code.
- **Risk:** ratifying blind → wrong call. **Mitigation:** sequence after E2/E3 evidence.
- **Rollback:** docs only — the freeze marker can be lifted and the doc re-amended, which by design
  re-opens the gate. **No backup/snapshot required.**

## 9. Validation / Success Metrics
- The architecture doc shows status **ratified/frozen** with a date and a decision-log line recording the
  INV-7 and INV-8 outcomes.
- The §4 truth table is consistent with the final invariants (no contradiction remains).
- M1 is formally unblocked (gate announced clear).

## 10. Open Questions
- **INV-7** — confirm "exclude wins within a facet," or flip to "include wins"? (Draft: exclude wins.)
- **INV-8** — confirm "highest-priority includer wins," or hard-error on dual-include? (Draft:
  highest-priority wins + warning.)
- Does the Owner want the validator **warnings** (INV-7/INV-8) implemented in this project's scope, or
  deferred to the `basestrategy-fulfillment` validator effort? (Affects M2/M3 task sizing.)
