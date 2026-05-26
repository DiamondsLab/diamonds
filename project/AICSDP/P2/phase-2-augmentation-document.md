# Phase 2 Toolset Augmentation Document

# @diamondslab/diamonds — Phase 2 Cycle

**Inventory Date:** 2026-05-22
**AI Model:** Claude Opus 4.7
**Practitioner:** Solo maintainer (DiamondsLab)
**Phase 1 Report:** Loaded — completed 2026-04-20

---

## 1. Phase 1 Report Access

| Dimension                               | Status                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------ |
| Phase 1 Information Report loaded       | Yes (via project knowledge)                                              |
| Specific findings referenceable         | Yes (F-01..F-42)                                                         |
| MC register referenceable               | Yes (22 MCs across Foundation/Capability/Productization tiers)           |
| Baseline rows referenceable             | Yes                                                                      |
| Constraint envelope referenceable       | Yes (HC-01..HC-08; HC-03 to be amended per P2-Obs-03)                    |
| Worst-case narrative referenceable      | Yes ("the gap between what Diamonds claims and what Diamonds can prove") |
| Self-evaluation scorecard referenceable | Yes (5 PASS + 1 CONDITIONAL on Scoring & Metrics)                        |

---

## 2. Capability Changes Since Phase 1

| Capability              | Phase 1               | Phase 2     | Notes                                                          |
| ----------------------- | --------------------- | ----------- | -------------------------------------------------------------- |
| GitHub MCP              | Loaded                | Loaded      | 7 open issues confirmed (same set as Phase 1)                  |
| Context7                | Loaded                | Unavailable | Approval not granted this session                              |
| Direct code access      | Via project knowledge | Same        | Phase 2 references Phase 1 evidence rather than re-inspecting  |
| Skills loaded           | None                  | None        | Framework knowledge from project knowledge (Playbook articles) |
| Custom AI configuration | None                  | None        | Standard Claude Opus 4.7                                       |

---

## 3. Code Access for Phase 2

| Dimension                           | Value                                                              |
| ----------------------------------- | ------------------------------------------------------------------ |
| Direct code access for Subject      | Via project knowledge (Phase 1 evidence)                           |
| Access mechanism                    | `project_knowledge_search`                                         |
| Phase 2 needs requiring code access | Low — most mechanism decisions reference Phase 1 catalog (Step 05) |
| Degradation posture if needed       | Practitioner spot-confirms specific code paths                     |

---

## 4. Other Capability Inventory

| Capability                              | Available           | Used For in Phase 2                                                                                                                                                        |
| --------------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Issue tracker access (GitHub MCP)       | Yes                 | Mechanism context for MC-08, MC-16, MC-17, MC-20 (issue-driven MCs); release-history consultation                                                                          |
| Library documentation lookup (Context7) | No                  | Would have informed mechanism choices for MC-01 (lodash replacement), MC-08 (doc-site tool selection); degrades to practitioner confirmation + caveated training knowledge |
| Command execution / measurement         | No                  | Cost-estimate verification deferred to practitioner                                                                                                                        |
| Web search                              | Available if needed | Mechanism-option discovery for specific library choices                                                                                                                    |

---

## 5. Graceful-Degradation Summary

| Missing Capability        | Degradation Posture                                                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Context7                  | Library/framework currency questions answered with caveat ("as of training cutoff January 2026"); practitioner confirms |
| Command execution         | Cost estimates carry ESTIMATED tag (no MEASURED upgrades possible mid-session)                                          |
| Token-usage live metering | P2-Obs-04 captures empirical validation as Phase 7 forward-handoff                                                      |

**Overall impact on Phase 2:** Minor. Phase 2's decisions reference Phase 1 evidence heavily; missing connectors mostly affect edge cases (specific library-version questions in Step 03).

---

## 6. Interview-Mode Defaults (Phase 2-specific)

| Step    | Default Mode                                   | Adjustment for this session                                                                                                                                                                                                                                                                                       |
| ------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Step 01 | Question-by-question (validation)              | Standard; Phase 1 Report fully loaded                                                                                                                                                                                                                                                                             |
| Step 02 | Draft-and-react                                | Standard                                                                                                                                                                                                                                                                                                          |
| Step 03 | Draft-and-react                                | Library-choice MCs (MC-01, MC-08) flagged for practitioner confirmation; Context7 unavailable                                                                                                                                                                                                                     |
| Step 04 | Draft-and-react + worst-case narrative         | Standard; Q3 worry ("unforeseen complexity causes plan to stall") feeds one candidate failure branch                                                                                                                                                                                                              |
| Step 05 | Draft-and-react with three-quantity cost model | **Cost model amended in-line for this run** per Specify decision: dev-hours + AI-acceleration multiplier + token-cost projection; per-category multipliers (mechanical cleanup 10×, doc authorship 8×, config edit 5×, novel design 3×); 6,000 tokens/Senior-dev-hour baseline; ~$2-3/100K-token Opus 4.7 pricing |
| Step 06 | Synthesis-only                                 | Standard; scorecard rigor discipline applies                                                                                                                                                                                                                                                                      |

---

## 7. Open Items for Practitioner Follow-Up Before Step 01

- [ ] None — Step 01 can begin immediately. The HC-03 amendment ("zero-cost" → two-layer budget) will be recorded during Step 01 validation; practitioner has already confirmed during Specify.
- [ ] (Forward note, not blocking) Phase 1 dogfooding observation log update — at end-of-Phase-2 review, P2-Obs-03 should be added to the Phase 1 dogfooding observations file as a "surfaced during Phase 2" entry, since the gap is in the Phase 1 toolkit.
