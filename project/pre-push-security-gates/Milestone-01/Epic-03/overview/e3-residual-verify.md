# Epic 3 — Residual + Verify (M1-E3)

> **Parent milestone:** [Milestone 2 — Audit Gate: Remove Unused Vulnerable Deps (M1)](../../overview/milestone-02-audit-remove-unused-vulnerable-deps.md) · **Maps to:** [`pre-push-security-gates-project-plan.md`](../../../pre-push-security-gates-project-plan.md) §5 M1 → M1-E3
> **Owner:** Engineer (+ Owner, conditional) · **Impact/blast radius:** possible `resolutions`/upgrade in `package.json` + lockfile; no source code · **Estimated effort:** S–M · **Status:** 📋 planned

## 1. Objective
Close the audit gate: disposition any advisory still present after M1-E2 (transitive residuals), then verify the gate is green and nothing regressed. If a residual has no clean fix, it gets a documented accepted-risk under **owner sign-off** — the gate is never silently left red or bypassed.

## 2. Acceptance criteria
- [ ] `yarn npm audit --severity moderate` → **0 findings**, **or** every remaining advisory has either a `resolutions`/upgrade fix applied or a documented **owner-signed accepted-risk**.
- [ ] `yarn build` (diamonds) green after removal + any `resolutions`.
- [ ] Submodule `yarn test` still **51/0** (via a reliable invocation — `npx hardhat test` if `yarn test` trips the state bug).
- [ ] Final audit result + dispositions recorded in `baseline.md` + the epic CHANGELOG.

## 3. Tasks
| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | For each residual advisory from M1-E2, check for a clean upgrade/`resolutions` fix on the transitive dependent | Engineer | fix identified or ruled out |
| 2 | Apply `resolutions`/upgrades where a clean fix exists; re-run audit | Engineer | those advisories cleared |
| 3 | For any advisory with **no** clean fix: document the accepted-risk (advisory, why unfixable, exposure) and obtain **owner sign-off (OP-M1-1)** | Engineer + **Owner** | signed off + recorded |
| 4 | Verify regressions: `yarn build` green; submodule tests still 51/0 | Engineer | both green |
| 5 | Record the final audit disposition in `baseline.md` + CHANGELOG | Engineer | recorded |

## 4. Dependencies & owner gates
- **Upstream:** M1-E2 (removal + residual list).
- **Owner gates:** **OP-M1-1 (conditional, BLOCKING if it fires):** owner sign-off for any residual advisory accepted as risk. If M1-E2 cleared all 26, this gate does not fire and M1-E3 is verification-only.
- **Downstream:** M4 (the unbypassed push needs the audit gate green/dispositioned).

## 5. Risks
| Risk | Mitigation |
|------|------------|
| A `resolutions` override forces an incompatible version and breaks build/tests | Re-run `yarn build` + `yarn test` after each override; revert the override if red |
| An advisory is genuinely unfixable and blocks the gate | Owner-signed accepted-risk (OP-M1-1) is the sanctioned path; `--severity moderate` scope keeps it explicit |
| `yarn test` trips the state bug, hiding a regression | Use the M0 reliable invocation (`npx hardhat test`); don't skip the regression check |

## 6. Notes
- Reversible: revert the `package.json` + lockfile commit (including any `resolutions`).
- The owner gate is **conditional** — likely unneeded if removing the two unused deps clears all 26 advisories, which is the expected outcome.
- Closes M1: audit becomes a passing (or fully-dispositioned) gate, unblocking M4's final push.
