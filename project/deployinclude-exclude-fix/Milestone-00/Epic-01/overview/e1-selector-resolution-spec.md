# Epic 1 — Selector-Resolution Spec (M0-E1)

> **Parent milestone:** [Milestone 1 — Oracle & Baseline (M0)](../../overview/milestone-01-oracle-and-red-baseline.md)
> **Maps to:** [project plan](../../../deployinclude-exclude-fix-project-plan.md) → §5 M0 epic table, row M0-E1 · **Reframed** oracle under review: [deployinclude-exclude-fix-architecture.md](../../../deployinclude-exclude-fix-architecture.md)
> **Owner:** Owner (Am0rfu5) · **Impact / blast radius:** Project-wide — this is the **TDD oracle gate**; every downstream test asserts what this epic freezes. · **Estimated effort:** S (one focused review session + a freeze stamp) · **Status:** 📋 planned

## 1. Objective

The selector-resolution semantics already exist in **draft** in the companion architecture doc, now
**reframed** (green-at-HEAD; design-hardening) — resolution algorithm, INV-1…9, the §4 truth table,
Fixture C additivity discriminator. This epic turns that **reframed** draft into a **ratified, frozen
oracle**: the Owner reviews it against the M0-E2 baseline ([the **green** baseline](../../baseline.md))
and M0-E3 audit evidence, settles the two defaults that were *authored but never confirmed*, and stamps
it frozen. Nothing in M1+ may begin until this gate clears — so the epic's whole value is removing
ambiguity before a single test is written.

## 2. Acceptance criteria

- [ ] Owner has reviewed the full **reframed** oracle (the §1 "Verified current state" banner — green at
      HEAD, design-hardening — plus semantics §2, invariants §3, truth table §4 incl. Fixture C, scope §5).
- [ ] **INV-7 ratified** — same-facet selector in both `deployInclude` and `deployExclude`: confirm the
      drafted default (**exclude wins** + validator warning) or record the chosen alternative.
- [ ] **INV-8 ratified** — two facets force-including the same selector: confirm the drafted default
      (**highest-priority includer wins** + warning) or record the chosen alternative (e.g. hard error).
- [ ] Any Owner-requested refinements incorporated; truth table re-checked for internal consistency with
      the (possibly amended) invariants.
- [ ] Fixture C (additivity discriminator) is specified concretely enough for M1-E3 to build without
      further design input.
- [ ] The architecture doc carries a **freeze marker** (status line "ratified/frozen" + date) and a
      one-line decision-log entry recording the INV-7/INV-8 outcomes.

## 3. Tasks

| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | Schedule the review **after** M0-E2 + M0-E3 land, so ratification is evidence-based | Engineer | Review occurs with baseline + audit artifacts in hand |
| 2 | Walk the oracle §2–§5 end-to-end; flag anything that conflicts with the captured baseline behavior | Owner + Engineer | Each invariant confirmed or marked for amendment |
| 3 | Decide **INV-7** (exclude-vs-include within one facet) | Owner | Decision recorded in the doc's decision log |
| 4 | Decide **INV-8** (dual-include conflict resolution) | Owner | Decision recorded in the doc's decision log |
| 5 | Incorporate refinements; re-verify the §4 truth table rows still hold under the final invariants | Engineer | Truth table consistent; no dangling contradictions |
| 6 | Confirm Fixture C spec is buildable (config shape, which facet, expected owners) | Engineer | M1-E3 has an unambiguous build target |
| 7 | Add freeze marker + decision-log line; announce the gate is **clear** | Owner | Doc status = ratified/frozen; M1 unblocked |

## 4. Dependencies & owner gates

- **Upstream:** M0-E2 (red baseline) and M0-E3 (test audit) should land first so ratification is against
  evidence, not assumptions. (Soft ordering — the gate itself is the hard constraint below.)
- **OP-1 (blocking owner gate):** **Owner must ratify and freeze the oracle.** This is owner-only — it is
  a design-authority decision, not an agent action. **All of M1–M4 is blocked until OP-1 clears.** The
  agent may draft and propose, but cannot self-approve the oracle.
- **Downstream:** M1 RED unit tests, M2/M3 corrections, and M4 sign-off all assert this frozen oracle.

## 5. Risks

| Risk | Mitigation |
|------|------------|
| Owner flips INV-7 or INV-8 *after* M1 tests exist | Force both decisions **here**, before any test code; surface them as named tasks (#3/#4), not buried defaults. |
| Ratifying blind (no evidence) leads to a wrong call | Sequence the review after E2/E3; ratify against the real baseline + audit. |
| Hidden contradiction between an amended invariant and the truth table | Task #5 re-verifies every truth-table row against the final invariant set. |
| Fixture C under-specified, stalling M1-E3 | Task #6 explicitly gates on a buildable Fixture C spec. |

## 6. Notes

- **Reversible:** docs only — the freeze marker can be lifted and the doc re-amended if M1 surfaces a
  flaw, but doing so re-opens the gate by design.
- **What stays untouched:** no source, test, or schema changes in this epic (or anywhere in M0).
- This epic is the natural place to confirm the oracle's pure-function shape is **promotable** into the
  larger `basestrategy-fulfillment` shared selector-resolution core (architecture doc §6) without
  redesign.
