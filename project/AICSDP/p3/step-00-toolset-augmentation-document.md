# Toolset Augmentation Document — Phase 3 (Design & Technical Analysis)

**Project:** `@diamondslab/diamonds` v1.3.2
**Phase 3 Run Date:** 2026-05-26
**Practitioner:** Solo maintainer (DiamondsLab)
**AI Model:** Claude Opus 4.7
**Code-Access Mode:** Hybrid with explicit flags
**Status:** Living document — amendments captured in §7

> ⚠️ This document is **living**. When AI capabilities shift during
> the Phase 3 run (a connector activates, a Skill becomes available,
> a tool errors out), add a dated entry to §7 — do not produce a new
> document.

---

## §1 — Direct Code Access

| Capability                       | Available? | Repository / Path                                                                                                                                    | Notes                                                                   |
| -------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Filesystem read (via GitHub MCP) | Yes        | `DiamondsLab/diamonds` main branch (v1.3.2)                                                                                                          | `get_file_contents` works for any path in the repo                      |
| Filesystem read (via GitHub MCP) | Yes        | `DF3NDR/ai-centric-software-development` main branch                                                                                                 | Phase 3 toolkit files, skill files, articles                            |
| Filesystem write                 | No         | —                                                                                                                                                    | Outputs land at `/mnt/user-data/outputs/`; practitioner commits to repo |
| Git operations                   | Read-only  | —                                                                                                                                                    | Tag/branch references via MCP; no write                                 |
| Cross-repo access                | Yes        | Both `DiamondsLab/diamonds` and `DF3NDR/ai-centric-software-development`; presumably also `DiamondsLab/diamonds-dev-env` if needed for MC-22 context | Via GitHub MCP                                                          |

## §2 — Library and Specification Documentation Lookup

| Capability                          | Available?        | Anticipated Use in Phase 3                                                                                         |
| ----------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| Context7                            | Yes               | MC-04 (TypeScript / JSDoc), MC-21 (ethers.js v6 Signer), MC-12 (CycloneDX 1.5, npm provenance, SLSA provenance)    |
| Project knowledge with library docs | N/A               | This project's knowledge base contains the Playbook articles, not external library docs — Context7 covers that gap |
| Web fetch                           | Yes (constrained) | For specs not in Context7 (e.g., specific RFC or W3C documents)                                                    |

## §3 — Cross-Repo Search and Code Cross-Reference

| Capability                    | Available?       | Use Case                                                                                       |
| ----------------------------- | ---------------- | ---------------------------------------------------------------------------------------------- |
| GitHub code search            | Yes              | Cross-reference verification for MC-22 integration-peer assumptions; consumer search for MC-21 |
| Enterprise / codebase search  | N/A              | No enterprise search configured                                                                |
| Cross-repo reference tracking | Yes (via search) | Manual via `Github:search_code`; not a dedicated cross-reference tool                          |

## §4 — Diagram and Visualization Rendering

| Capability                     | Available?           | Notes                                                                                                   |
| ------------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------- |
| Mermaid in rendered output     | Yes                  | Selective use for layer diagrams, lifecycle diagrams, schema composition diagrams                       |
| External diagramming source    | Yes (via Visualizer) | For more complex visual artifacts                                                                       |
| Visualization MCP / Visualizer | Yes                  | Available but used judiciously — design specifications are primarily prose+tables, not visual artifacts |

## §5 — Skills, Custom AIs, Specialized Agents

| Capability                 | Active?                                   | Description                                                                                                                                                                                              |
| -------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI-Centric Playbook Skill  | Yes (SKILL.md consulted at session start) | `DF3NDR/ai-centric-software-development:skills/ai-centric-playbook/`; three reference files (`core-principles.md`, `sdd-cycle.md`, `building-blocks-and-toolsets.md`) on-demand; not preemptively loaded |
| Project-level instructions | Yes                                       | Claude Project Instructions for this conversation; provides AI-Centric Software Development consultant role framing                                                                                      |
| Specialized agents         | No                                        | None configured for this session                                                                                                                                                                         |
| Other Skills loaded        | None                                      | —                                                                                                                                                                                                        |

## §6 — Phase 2 Artifact Access

| Artifact                                     | Loaded?                                 | Access Path                                                                    |
| -------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------ |
| Phase 2 Improvement Plan (Step 06 synthesis) | Yes — loaded into context               | `DiamondsLab/diamonds:project/AICSDP/P2/step-06-improvement-plan-synthesis.md` |
| Phase 2 Step 03 (Mechanism Decisions)        | Yes — fetched during Step 01 Category 5 | `DiamondsLab/diamonds:project/AICSDP/P2/step-03-mechanism-decisions.md`        |
| Phase 2 Step 01-02, 04-05 artifacts          | On-demand                               | `DiamondsLab/diamonds:project/AICSDP/P2/*` via GitHub MCP                      |
| Phase 1 Information Report                   | On-demand                               | Presumably `DiamondsLab/diamonds:project/AICSDP/P1/` via GitHub MCP            |

## §7 — Mid-Phase Amendments

_Append-only. When a capability shifts during the Phase 3 run, add a dated entry below. Do not edit prior entries._

| Date                                                   | Step | Capability | Change | Impact |
| ------------------------------------------------------ | ---- | ---------- | ------ | ------ |
| _(none yet — populated as the Phase 3 run progresses)_ |      |            |        |        |

## §8 — Known Friction Points

| Capability | Friction                                                      | Workaround                                                             |
| ---------- | ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| GitHub MCP | Theoretical rate limiting on heavy fetch cycles               | Cache fetched artifacts in working context; batch reads where possible |
| Context7   | Occasionally returns stale or incomplete library snapshots    | Cross-check against authoritative source when stakes warrant           |
| Visualizer | Best for inline single-concept visuals, not full system views | Use selectively where prose+tables can't convey the design             |

## §9 — Code-Access Mode Rationale

This session operates in **Hybrid with explicit flags** mode. GitHub MCP provides read access to both `DiamondsLab/diamonds` (subject) and `DF3NDR/ai-centric-software-development` (toolkit + Playbook reference). Code-derived claims about Diamonds source use `[CONFIRM]` when I've fetched and read the relevant file; `[AWARE]` when relying on the Improvement Plan's restatement without re-fetching; `[QUESTION]` when something needs practitioner clarification. The mode is unlikely to shift during the run unless GitHub MCP errors out or Context7 becomes unavailable; if that happens, §7 captures the amendment.

---

## Version

v1.0 (initial Phase 3 capability inventory; living thereafter)
