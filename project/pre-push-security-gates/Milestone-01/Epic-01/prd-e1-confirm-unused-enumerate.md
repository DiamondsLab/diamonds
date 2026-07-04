# Change Plan (PRD) — M1-E1 Confirm Unused + Enumerate

> **Expands:** [`overview/e1-confirm-unused-enumerate.md`](overview/e1-confirm-unused-enumerate.md) · **Parent:** [Milestone 2 (M1)](../overview/milestone-02-audit-remove-unused-vulnerable-deps.md) · **Plan:** [`pre-push-security-gates-project-plan.md`](../../pre-push-security-gates-project-plan.md)
> **Type:** read-only analysis · **Status:** 📋 ready for `/generate-tasks` · **Date:** 2026-07-03

## 1. Overview & Problem
M1 clears the npm-audit gate by removing the unused `axios` + `lodash` direct dependencies. Before removing anything, this epic **proves** they're truly unused (beyond `src/`) and **enumerates** the 26 advisories, deciding per-advisory whether direct removal clears it or a transitive path keeps it alive. **Goal:** produce the go/no-go evidence + residual work-list for M1-E2/E3 — read-only, no code/dep change.

## 2. Goals
- G1 — Confirm `axios` + `lodash` have **0 usages** across `src`, `scripts`, `test`, root **config files**, **dynamic `require`**, and the package **barrel / `exports`** (no re-export).
- G2 — Enumerate all **26 advisories** as `advisory id | package | severity | direct/transitive | clears-on-removal?`.
- G3 — Record a clear **go/no-go** + residual list into `baseline.md` (M1 section).

## 3. Scope — Components & Services
- **Repo:** `packages/diamonds/` only.
- **Read:** `src/**`, `scripts/**`, `test/**`, config files (`hardhat.config.ts`, `tsconfig*.json`, `.mocharc*`, `package.json` `exports`), `src/index`/barrel; `yarn npm audit` output.
- **Written:** `packages/diamonds/project/pre-push-security-gates/baseline.md` (M1 findings/go-no-go section).

## 4. Stakeholders & Impact
- **Engineer (agent):** executes; only actor. **Owner:** none. **User-facing/production impact:** none — read-only analysis.

## 5. Operational Requirements
1. Grep `axios`/`lodash` (import, `require`, dynamic) across `src`, `scripts`, `test`, and root config files; record 0-usage or list any usage.
2. Inspect the package barrel/`src/index` + `package.json` `exports` for any re-export of axios/lodash.
3. Run `yarn npm audit --severity moderate`; map each of the 26 advisories → package + severity.
4. For each advisory, determine **direct vs transitive** (path only through the direct axios/lodash declaration, or also via another dependency).
5. Record the enumerated table + **go/no-go** verdict + residual list in `baseline.md`.
6. Make **no** code, dependency, or config change.

## 6. Security & Compliance Considerations
- Read-only scans + a doc update; no secrets/credentials/elevated privileges.
- No secret-adjacent findings expected (advisories are dependency CVEs, not code secrets); record ids/packages, not any sensitive content.

## 7. Non-Goals (Out of Scope)
- **Removing** the deps (M1-E2) or **fixing** residuals (M1-E3).
- semgrep/slither/hook work (M2–M4).
- Any code/config change.

## 8. Risk, Rollback & Recovery
- **Backup/snapshot required:** no — read-only.
- **Risk:** a usage via a path the grep missed → **Mitigation:** explicitly check configs + `exports`/barrel + dynamic `require`.
- **Risk:** advisory-to-package attribution ambiguous → **Mitigation:** use audit tree output (Dependents/Tree Versions) or `--json`.
- **Rollback:** revert the `baseline.md` edit (documentation only).

## 9. Validation / Success Metrics
- `baseline.md` M1 section lists all 26 advisories with the direct/transitive column filled + a go/no-go verdict.
- The axios/lodash 0-usage claim is backed by the widened grep (configs/dynamic/exports), not just `src/`.
- `git status` shows only `baseline.md` (+ this epic's docs) changed — no source/config/dep.

## 10. Open Questions
- If a residual transitive advisory is found, is a `resolutions`/upgrade preferred over accepted-risk? **Default:** decide in M1-E3 (prefer a clean fix; accepted-risk with owner sign-off only if none exists).

**Next:** `/generate-tasks` against this PRD.
