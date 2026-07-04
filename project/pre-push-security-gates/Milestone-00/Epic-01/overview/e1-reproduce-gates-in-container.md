# Epic 1 — Reproduce Gates In-Container (M0-E1)

> **Parent milestone:** [Milestone 1 — Baseline & Reliable Scan Harness (M0)](../../overview/milestone-01-baseline-and-scan-harness.md) · **Maps to:** [`pre-push-security-gates-project-plan.md`](../../../pre-push-security-gates-project-plan.md) §5 M0 → M0-E1
> **Owner:** Engineer · **Impact/blast radius:** read-only; no source/config/hook change · **Estimated effort:** S · **Status:** 📋 planned

## 1. Objective
Establish a **reliable, repeatable way to run each pre-push gate inside the devcontainer** that does **not** trip the yarn `findPackageLocation` state-file bug (which makes the hook's `yarn <script>` calls fail regardless of code quality). Prioritize the gates that will **remain** after this project — `npm audit`, `semgrep`, `git-secrets` — recording the exact working command and its pass/fail behavior for each. For `slither` and `tests` (which leave the gate in M3/M4) record only *current* behavior, best-effort. The output is the harness M1–M4 use to prove a gate is genuinely green vs merely un-runnable.

## 2. Acceptance criteria
- [ ] A **"Reliable in-container invocations" table** written into `baseline.md` (`gate → exact command → exit behavior → notes`).
- [ ] `npm audit` gate: a command that runs in-container and returns the moderate-severity result (confirm whether `yarn npm audit --severity moderate` works as-is, else a direct/`npm run` equivalent). Flags mirror `.husky/pre-push` exactly.
- [ ] `semgrep` gate: direct-binary command runs (`semgrep scan --config .semgrep.yml --exclude-rule weak-encryption`) — matches the `semgrep:scan` script's config/flags.
- [ ] `git-secrets` gate: `git secrets --scan` runs and returns clean/dirty.
- [ ] `slither` + `tests`: current behavior recorded best-effort (command + whether it runs / errors), explicitly marked *not hardened* (removed in M3 / leaves gate in M4).
- [ ] No source, config, or hook modified.

## 3. Tasks
| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | Confirm the `npm audit` invocation runs in-container; capture exact command + exit (mirror `--severity moderate`) | Engineer | command + exit recorded |
| 2 | Confirm the `semgrep` direct-binary invocation runs; capture command + exit (mirror `.semgrep.yml` + `--exclude-rule weak-encryption`) | Engineer | command + exit recorded |
| 3 | Confirm `git secrets --scan` runs; capture command + exit | Engineer | command + exit recorded |
| 4 | Record `slither` current behavior best-effort (`slither . --config-file slither.config.json --ignore-compile`; note artifact/compile need) | Engineer | current behavior recorded, marked not-hardened |
| 5 | Record `tests` invocation best-effort (note `yarn test` hits the state bug; capture a working alt e.g. `npx hardhat test` if trivial) | Engineer | current behavior recorded, marked not-hardened |
| 6 | Write the "Reliable in-container invocations" table into `baseline.md` | Engineer | table present + cross-checked against `.husky/pre-push` + `package.json` |

## 4. Dependencies & owner gates
- **Upstream:** none (first epic of the first milestone).
- **Owner gates:** none — entirely read-only, no outward-facing action.
- **Downstream:** M0-E2 (uses these invocations to gather findings); M1–M4 (use the invocations to verify their gate is green in-container).

## 5. Risks
| Risk | Mitigation |
|------|------------|
| A "working" invocation silently differs from what the hook runs | Cross-check each command's flags/config against the exact `.husky/pre-push` line and the `package.json` script it calls |
| `yarn npm audit` itself trips the state bug on some runs | If it does, record a direct/`npm`-based equivalent; the goal is *a* reliable command, not necessarily the yarn one |
| slither won't run without compiled artifacts | Acceptable — record the need/failure as-is; it's removed in M3, so no hardening required |

## 6. Notes
- Fully reversible — produces documentation only.
- Much of this is **already known** from the planning-phase scoping: `yarn npm audit --severity moderate` returned the 2 lodash findings, `semgrep scan --config .semgrep.yml --exclude-rule weak-encryption` returned 10 findings, and `git secrets --scan` was clean — all in-container. This epic formalizes those into the invocations table.
- Keep the table honest about *which* gates are hardened (audit/semgrep/secrets) vs best-effort snapshots (slither/tests).
