# Change Plan (PRD) — M0-E1 Reproduce Gates In-Container

> **Expands:** [`overview/e1-reproduce-gates-in-container.md`](overview/e1-reproduce-gates-in-container.md) · **Parent:** [Milestone 1 (M0)](../overview/milestone-01-baseline-and-scan-harness.md) · **Plan:** [`pre-push-security-gates-project-plan.md`](../../pre-push-security-gates-project-plan.md)
> **Type:** read-only groundwork · **Status:** 📋 ready for `/generate-tasks` · **Date:** 2026-07-03

## 1. Overview & Problem
The `@diamondslab/diamonds` `.husky/pre-push` hook runs its security suite through `yarn <script>` calls. Inside the devcontainer those calls fail on the yarn `findPackageLocation` node-modules state-file bug — so a gate can "fail" without telling us anything about the code. Before we fix any real finding (M1–M3) or redesign the hook (M4), we need a **reliable way to run each gate in-container** that sidesteps that bug. **Goal:** produce a documented, repeatable in-container invocation for each *remaining* gate (npm audit, semgrep, git-secrets), and record slither/tests current behavior best-effort — captured as a "Reliable in-container invocations" table in `baseline.md`.

## 2. Goals
- G1 — A working in-container command for **npm audit** returning the moderate-severity result (mirroring `--severity moderate`).
- G2 — A working in-container command for **semgrep** (mirroring `.semgrep.yml` + `--exclude-rule weak-encryption`).
- G3 — A working in-container command for **git-secrets** (`git secrets --scan`).
- G4 — **slither** + **tests** current behavior recorded best-effort, explicitly marked *not hardened*.
- G5 — All of the above captured as a table in `baseline.md`, each command cross-checked against the exact `.husky/pre-push` line and `package.json` script it represents.

## 3. Scope — Components & Services
- **Repo:** `packages/diamonds/` (the `@diamondslab/diamonds` submodule) only.
- **Files read:** `.husky/pre-push`, `package.json` (security scripts: `audit`, `semgrep:scan`, `slither:scan`, `git-secrets:scan`, `test`), `.semgrep.yml`, `slither.config.json`.
- **Tools invoked (read-only):** `yarn npm audit` / `npm audit`, `semgrep`, `git secrets`, `slither`, `hardhat test`.
- **File written:** `packages/diamonds/project/pre-push-security-gates/baseline.md` (invocations table section — the findings section is M0-E2).

## 4. Stakeholders & Impact
- **Engineer (agent):** executes; the only actor.
- **Owner:** none — no approval needed; nothing outward-facing.
- **User-facing / production impact:** none. This is internal dev-tooling groundwork that changes no code, config, or hook.

## 5. Operational Requirements
1. For **npm audit**, determine and record a command that runs in-container and returns the moderate result; confirm whether `yarn npm audit --severity moderate` works as-is (planning evidence: it did) or a direct/`npm audit` equivalent is needed. Record exact command + exit behavior.
2. For **semgrep**, record the direct-binary command `semgrep scan --config .semgrep.yml --exclude-rule weak-encryption` (the `--error` flag from the script is optional for the harness) + exit behavior.
3. For **git-secrets**, record `git secrets --scan` + exit behavior.
4. For **slither**, record best-effort behavior of `slither . --config-file slither.config.json --ignore-compile` (note if it needs compiled artifacts / errors); mark *not hardened*.
5. For **tests**, note that `yarn test` trips the state bug; record a working alternative if trivial (e.g. `npx hardhat test`); mark *not hardened*.
6. Write the **"Reliable in-container invocations"** table (`gate → exact command → exit behavior → hardened? → notes`) into `baseline.md`; cross-check each row against `.husky/pre-push` + `package.json`.
7. Make **no** change to any source file, config, or hook.

## 6. Security & Compliance Considerations
- No secrets, credentials, or elevated privileges involved — all commands are read-only local scans.
- `git secrets --scan` reads history for secret patterns (already clean per planning); no data leaves the container.
- No production or sensitive resource is touched; no human-approval gate applies.

## 7. Non-Goals (Out of Scope)
- **Fixing** any finding, changing any dependency, rule, config, or hook (M1–M4).
- **Hardening** slither or tests to run reliably in-container (slither removed in M3; tests leave the gate in M4) — best-effort snapshot only.
- The **findings enumeration** itself (advisory ids, per-rule semgrep findings) — that is M0-E2.
- CI (out of scope for the whole project).

## 8. Risk, Rollback & Recovery
- **Backup/snapshot required:** no — read-only; nothing to back up.
- **Risk:** an invocation "works" but diverges from what the hook runs → **Mitigation:** mirror the hook's exact flags/config; cross-check every row.
- **Risk:** `yarn npm audit` intermittently trips the state bug → **Mitigation:** record a direct/`npm` equivalent; the requirement is *a* reliable command.
- **Rollback:** delete/revert the `baseline.md` invocations section (documentation only); nothing else changes.

## 9. Validation / Success Metrics
- Each of npm-audit / semgrep / git-secrets has a recorded command that, when run in the devcontainer, completes and returns a result **without** the `findPackageLocation` error.
- slither + tests have a recorded current-behavior line, marked not-hardened.
- The invocations table exists in `baseline.md`, each row cross-checked against `.husky/pre-push` + `package.json`.
- `git status` shows no change to source/config/hook (only the new `baseline.md`).

## 10. Open Questions
- Should the invocations table live in `baseline.md` (shared with M0-E2) or a separate `scan-harness.md`? **Default:** `baseline.md`, one doc for the milestone.
- If `yarn npm audit` proves flaky in-container, is a plain `npm audit --audit-level=moderate` equivalent acceptable as the recorded command? **Default:** yes — any reliable command satisfies the goal.

**Next:** `/generate-tasks` against this PRD to produce the executable task list.
