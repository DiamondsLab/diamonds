# Changelog — M0-E2 Baseline Capture

## 2026-06-27 — Baseline established; project reframed

- Ran the two selector suites (isolated + together) and the full `yarn test` at
  `packages/diamonds` @ `dd4ddf9` (`release/v1.3.3`).
- **Finding:** full suite **GREEN** — 189 passing / 69 pending / **0 failing**; single-sided
  `deployInclude`/`deployExclude` already resolve correctly for **fresh deploys**. The reported
  "failing tests / requires both sides" premise did **not** reproduce.
- Characterized `5b2f7af` as an **upgrade/redeploy-path-only** fallback (unverified by the current suite).
- Identified the genuine open gaps: **additivity (INV-3) untested**, **upgrade-path unexercised**,
  **dead inverted `higherPrioritySplit`**, **vacuous L142-164 assertion**.
- Artifact: [`Milestone-00/baseline.md`](../baseline.md). Logs: session scratchpad.
- **Upward impact:** reframed the [project plan](../../deployinclude-exclude-fix-project-plan.md) and
  [oracle](../../deployinclude-exclude-fix-architecture.md) from "fix red tests" to **design-hardening**;
  re-pointed M2 (additivity) and M3 (upgrade-path & dead-code). M0-E2 **complete**.
