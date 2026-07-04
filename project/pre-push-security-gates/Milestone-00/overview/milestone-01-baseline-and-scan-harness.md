# Milestone 1 — Baseline & Reliable Scan Harness (M0)

> **Maps to:** [`pre-push-security-gates-project-plan.md`](../../pre-push-security-gates-project-plan.md) §5 → **M0** (and Milestone map row M0). No architecture doc for this project.
> **Status:** 📋 planned · **Impact:** Low — read-only groundwork, no gate changes · **Author:** Engineer (with Claude) · **Date:** 2026-07-03
> **Epic breakouts:** [`e1-reproduce-gates-in-container`](../Epic-01/overview/e1-reproduce-gates-in-container.md) · [`e2-findings-baseline`](../Epic-02/overview/e2-findings-baseline.md) *(links resolve once `/breakout-epics` runs)*

## 1. Why this milestone exists

The `.husky/pre-push` hook is currently un-passable in the devcontainer for two different reasons — real security findings **and** the yarn `findPackageLocation` state-file bug that makes the hook's `yarn <script>` calls fail regardless of code quality. Before fixing anything (M1–M3) or redesigning the hook (M4), we need a **trustworthy way to run each gate in-container** and a **recorded snapshot of every current finding**. Without that, we can't tell a fixed gate from a gate that merely failed to execute, and we can't prove progress. M0 is the first node on the critical path: `M0 → M1 → M2 → M3 → M4`. It ships no behavior change — it produces knowledge and a repeatable harness the later milestones measure themselves against.

## 2. Goal & exit criteria

**Goal:** Be able to run each pre-push gate reliably inside the devcontainer (bypassing the yarn state bug), and capture the current state of every blocking finding as a baseline to measure M1–M4 against.

**Exit criteria:**
- [ ] A **`baseline.md`** in the project dir enumerating current results for every gate: npm audit, semgrep, git-secrets, slither (best-effort), and tests — with counts, severities, rule ids, and offending files where applicable.
- [ ] A **documented direct-binary / `npm run` invocation** for each *remaining* gate (audit, semgrep, git-secrets) that completes in-container **without** hitting the yarn state-file bug.
- [ ] The reusable **tooling-repo rationale** note (diamonds is a TS tool; in-repo contracts are test fixtures) authored once here for M2 (rule scoping) and M3 (slither removal) to cite.
- [ ] No source, config, or hook changed (M0 is read-only groundwork).

## 3. Scope

**In scope**
- Finding and documenting reliable in-container invocations for the gates that **remain** after this project: `npm audit`, `semgrep`, `git-secrets`.
- Enumerating and recording current findings for **all** gates (including slither + tests) as baseline evidence.
- Writing the shared tooling-repo rationale note.

**Out of scope (deferred)**
- Any fix, suppression, rule change, dependency change, or hook edit (that's M1–M4).
- Making **slither** or **tests** run *reliably* in-container — slither is removed in M3 and tests leave the gate in M4, so they get only a **best-effort** current-state snapshot here, not a hardened invocation.
- CI (explicitly out of scope for the whole project).

## 4. Roles on this milestone

| Who | Does what |
|-----|-----------|
| **Engineer** (agent) | Runs each gate via direct binaries, records invocations + findings into `baseline.md`, writes the rationale note. All read-only. |
| **Owner** | None required — no outward-facing or irreversible action in M0. |

No blocking owner gates in this milestone.

## 5. Epics

| Epic | Title | Owner | Impact | Breakout |
|------|-------|-------|--------|----------|
| M0-E1 | Reproduce gates in-container | Engineer | Groundwork | [`e1-reproduce-gates-in-container`](../Epic-01/overview/e1-reproduce-gates-in-container.md) |
| M0-E2 | Findings baseline + rationale | Engineer | Reference | [`e2-findings-baseline`](../Epic-02/overview/e2-findings-baseline.md) |

**M0-E1 — Reproduce gates in-container.** Establish a reliable, repeatable invocation for each gate that avoids `yarn <script>` (which triggers the devcontainer's `findPackageLocation` state-file bug). Prioritize the gates that **remain**: `npm audit` (the hook's `yarn npm audit --severity moderate` — confirm whether the bare `yarn npm audit` works or needs a direct/`npm run` form), `semgrep` (direct binary: `semgrep scan --config .semgrep.yml --exclude-rule weak-encryption`), `git-secrets` (`git secrets --scan`). Record the exact working command for each. For slither and tests, record only *that* they run / their current output — no effort to harden them (they leave in M3/M4). Acceptance shape: a short table of `gate → working in-container command → exit behavior`. Key risk: an invocation that "works" but silently differs from what the hook runs — mirror the hook's flags exactly.

**M0-E2 — Findings baseline + rationale.** Using the M0-E1 invocations, write `baseline.md` capturing the current state: **npm audit** — 2 × lodash moderate (prototype pollution, `4.17.21`, no upstream 4.x patch); **semgrep** — 10 blocking findings across 6 of the custom `.semgrep.yml` rules (record rule id + file + line for each, noting most are Solidity-security rules likely firing on test-fixture contracts, plus `typescript-any-usage`); **git-secrets** — clean; **slither** — best-effort enumeration (or a note that it needs compiled artifacts / errored), framed as evidence for the M3 removal decision; **tests** — submodule `yarn test`/`test:unit` currently green (51/0). Then author the **tooling-repo rationale** paragraph (diamonds is a TS library/tool; the in-repo Solidity contracts exist only as test fixtures, so contract-security analyzers are applied with that lens) — the single source M2 and M3 cite. Acceptance shape: `baseline.md` committed with per-gate findings + the rationale. Key risk: baselining stale results — run each gate fresh from a clean-ish tree and timestamp it.

*(Note: the planning phase already produced most of these numbers and working invocations for audit/semgrep/git-secrets, so M0 is largely formalizing them into `baseline.md` rather than net-new discovery.)*

## 6. Dependencies & sequencing

- **Upstream:** none — M0 is the first milestone.
- **Internal ordering:** M0-E1 (invocations) → M0-E2 (baseline uses those invocations). E2's rationale note has no code dependency and can be drafted in parallel.
- **Owner gates carried in:** none.
- **Downstream consumers:** M1 (audit target), M2 (semgrep target + cites the rationale), M3 (slither removal cites the rationale + baseline evidence), M4 (knows which gates must run in-container). Every later milestone measures "green" against this baseline.

## 7. Rollback posture

Nothing to roll back — M0 writes only documentation (`baseline.md`, rationale) and changes no source, config, or hook. If a baseline entry is wrong, re-run the gate and correct the doc.

## 8. Risks (milestone-scoped)

| Risk | Mitigation |
|------|------------|
| A direct-binary invocation diverges from what the hook actually runs (different flags/paths) | Mirror the hook's exact flags; cross-check each command against the corresponding `package.json` script + `.husky/pre-push` line |
| slither can't be run cleanly in-container (needs compiled artifacts / errors) | Acceptable — record the failure/partial as-is; slither is removed in M3, so the baseline is evidence, not a gate to harden |
| Baseline captured against a dirty/stale tree | Note working-tree state + timestamp in `baseline.md`; re-run if source changes before M1 starts |
| Findings shift between baseline and fix (deps re-resolved) | Keep `baseline.md` a living reference; M1–M3 re-run their own gate to confirm 0, not just diff the baseline |

## 9. Definition of Done for Milestone 1 (M0)

M0 is closeable when:
- `baseline.md` exists with current results for all five gates (audit, semgrep, git-secrets, slither best-effort, tests) including rule ids/files for semgrep and advisory ids for audit.
- Each **remaining** gate (audit, semgrep, git-secrets) has a recorded in-container invocation that completes without the yarn state-file bug.
- The tooling-repo rationale note is written and ready for M2/M3 to cite.
- No source/config/hook was modified.
