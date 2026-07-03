# Change Plan (PRD) — M1-E3 Residual + Verify

> **Expands:** [`overview/e3-residual-verify.md`](overview/e3-residual-verify.md) · **Parent:** [Milestone 2 (M1)](../overview/milestone-02-audit-remove-unused-vulnerable-deps.md) · **Plan:** [`pre-push-security-gates-project-plan.md`](../../pre-push-security-gates-project-plan.md)
> **Type:** verification-only · **Status:** 📋 ready for `/generate-tasks` · **Date:** 2026-07-03 · **Depends on:** M1-E2 (audit 26 → 0)

## 1. Overview & Problem
M1-E2 cleared all 26 advisories by removing the unused axios + lodash direct deps → **no residual advisory** and the conditional owner gate **OP-M1-1 does not fire**. This epic is therefore **verification-only**: confirm the audit gate is green and that removing those deps didn't regress the build or tests, then record M1 closure. **Goal:** prove M1's exit criteria hold.

## 2. Goals
- G1 — `yarn npm audit --severity moderate` → 0 findings (re-confirm the gate).
- G2 — `yarn build` (diamonds) green after the removal.
- G3 — Submodule tests still **51/0** (via a reliable invocation).
- G4 — M1 closure recorded in `baseline.md` + CHANGELOG.

## 3. Scope — Components & Services
- **Repo:** `packages/diamonds/` only.
- **Run (read-only checks):** `yarn npm audit --severity moderate`, `yarn build` (or `npm run build`), `yarn test` / `npx hardhat test`.
- **Written:** `baseline.md` (M1 closure) + `Milestone-01/Epic-03/CHANGELOG.md`.
- **No** dependency, source, or config change (that was M1-E2).

## 4. Stakeholders & Impact
- **Engineer (agent):** executes. **Owner:** none — OP-M1-1 does **not** fire (no residual advisory). **User-facing/production impact:** none — verification only.

## 5. Operational Requirements
1. Re-run `yarn npm audit --severity moderate`; confirm exit 0 / 0 findings.
2. Run `yarn build` (or `npm run build` if the yarn runner trips the state bug); confirm green.
3. Run the submodule tests via a reliable invocation (`npx hardhat test` if `yarn test` trips the state bug); confirm the prior **51/0** holds.
4. Record M1 closure (audit green, no residual, build+tests green) in `baseline.md` + the epic CHANGELOG.
5. Make **no** dependency/source/config change.

## 6. Security & Compliance Considerations
- No secrets/credentials/elevated privileges — read-only verification + a doc update. This confirms a *reduction* in attack surface (0 audit advisories).

## 7. Non-Goals (Out of Scope)
- Any residual/transitive advisory disposition — **none exists** (audit is 0).
- Any `resolutions`/upgrade — unneeded.
- semgrep/slither/hook work (M2–M4).

## 8. Risk, Rollback & Recovery
- **Backup/snapshot required:** no — read-only verification.
- **Risk:** `yarn test` trips the state bug and hides a regression → **Mitigation:** use `npx hardhat test` (the M0 reliable path); don't skip the check.
- **Risk:** the removal broke a build path that implicitly used axios/lodash → **Mitigation:** that's exactly what G2/G3 catch; if red, revert M1-E2's commit.
- **Rollback:** if verification fails, revert M1-E2 (`git checkout` package.json + yarn.lock).

## 9. Validation / Success Metrics
- `yarn npm audit --severity moderate` → exit 0.
- `yarn build` → green.
- Submodule tests → 51/0 (or the current passing count) via `npx hardhat test`.
- M1 closure recorded; `git status` shows only doc changes for this epic.

## 10. Open Questions
- None — M1-E2's re-audit already showed 0; this epic confirms no regression and closes M1.

**Next:** `/generate-tasks` against this PRD.
