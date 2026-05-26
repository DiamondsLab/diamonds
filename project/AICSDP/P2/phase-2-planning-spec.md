# Phase 2 Planning Specification

# @diamondslab/diamonds — Phase 2 Cycle

**Specify Date:** 2026-05-22
**Subject:** @diamondslab/diamonds v1.3.2 (re-verified; no drift since Phase 1)
**Practitioner:** Solo maintainer
**AI:** Claude Opus 4.7
**Phase 1 completion:** 2026-04-20

---

## Phase 2 Intent

Produce the Improvement Plan from the Phase 1 Information Report.
No other Phase 2 deliverables (no external roadmap, no stakeholder
communication, no budget request).

## Phase 2 Scope Anchors

- **Starting tier frame:** Phase 1-suggested Foundation / Capability /
  Productization tiering. Step 04 may refine within these tiers but
  does not re-tier.
- **Capacity envelope:** HC-08 unchanged at <5 hr/week ecosystem
  maintainer-time, Diamonds-specific being a minority share.
- **Execution horizon:** Open-ended (per HC-02). Cost-modeling
  produces hours-to-complete figures with capacity-fit assessment,
  not a fixed-deadline projection.

## Cost-Model Decision (Amendments to Phase 2 v1.0 Step 05)

Step 05 will produce per-MC cost rows using a three-quantity model:

- **Dev-hours estimate** (Senior Developer baseline, without AI
  assistance) with MEASURED/ESTIMATED/BELIEVED/UNMEASURED tag
- **AI-acceleration multiplier** (per-category default: mechanical
  cleanup = 10×, doc authorship = 8×, config edit = 5×, novel design
  = 3×) with tag; converts to maintainer-hours
- **Token-cost projection** (~6,000 tokens per Senior-dev-hour
  baseline, Opus 4.7 pricing ~$2-3 per 100K tokens) with tag;
  produces API-cost projection per MC

This represents an in-line dogfood improvement applied during the
Diamonds run; observations P2-Obs-01 and P2-Obs-02 stay Open to drive
v1.1 formalization at end-of-Phase-2 review.

## HC Amendments (Recorded During Phase 2)

- **HC-03 amended:** From "zero budget" to two-layer budget —
  commercial-tools layer = $0 (unchanged), AI-usage layer =
  ESTIMATED via Step 05 token-cost projection, not pre-committed
  to a specific cap. Observation P2-Obs-03 captures the underlying
  Phase 1 toolkit gap.
- **HC-04 affected:** "No commercial-tier services" remains
  binding (no SaaS subscriptions, no commercial AI agents beyond
  the existing Claude usage).
- **MK-07 affected:** "Zero-budget / OSS-only operation" reframes
  to "OSS-only operation with AI usage as the only non-OSS-tooling
  cost layer."

## Worst-Case Plan-Failure Preview (Forward Input to Step 04)

Practitioner's biggest current worry, captured for Step 04 worst-case
narrative drafting: _"unforeseen complexity that causes the
implementation of the plan to stall and not reach completion."_
Step 04 will draft this as one candidate failure branch alongside
others.

## Dogfooding Observations Accumulated So Far

- P2-Obs-01: Cost framing assumes pre-AI man-hour-to-maintainer-time equivalence
- P2-Obs-02: Token-cost dimension as a measurable cost layer
- P2-Obs-03: "Zero-cost budget" framing is incompatible with AI-Centric SD reality (affects Phase 1 toolkit)
- P2-Obs-04: Token-baseline empirical validation as Phase 7 operational tracking

All Open. None acted on during the run per Option B protocol.

## Sources

- Phase 1 Current-State Information Report (Step 06 synthesis)
- Phase 1 Steps 01-05 detailed artifacts
- Phase 1 dogfooding-observations.md (26 observations, all Acted at v1.1)
- Phase 2 instructions file (v1.0)
- Practitioner confirmations 2026-05-22
