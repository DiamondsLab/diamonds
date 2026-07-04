# Change Plan (PRD) — M3-E1 Remove Slither Gate + Document

> **Expands:** [`overview/e1-remove-slither-gate.md`](overview/e1-remove-slither-gate.md) · **Parent:** [Milestone 4 (M3)](../overview/milestone-04-decommission-slither.md) · **Plan:** [`pre-push-security-gates-project-plan.md`](../../pre-push-security-gates-project-plan.md)
> **Type:** hook + package.json change (reversible) · **Status:** 📋 ready for `/generate-tasks` · **Date:** 2026-07-04 · **Owner decision:** keep `slither:*` scripts + `slither.config.json` as **optional-manual**

## 1. Overview & Problem
Slither is a blocking pre-push gate that doesn't belong on this repo: diamonds is a TS tool, the in-repo contracts are test fixtures, and slither **errors in-container** (crytic-compile `KeyError`, per M0). **Goal:** remove slither from the two blocking paths (`.husky/pre-push` + the `security-check` aggregate) and document why — **keeping** the `slither:*` scripts + `slither.config.json` as optional-manual tools (owner's choice).

## 2. Goals
- G1 — Slither block removed from `.husky/pre-push`.
- G2 — `yarn slither:scan` removed from the `security-check` script in `package.json`.
- G3 — `slither:scan`/`slither:check` scripts + `slither.config.json` **kept** (out of every gate; runnable manually).
- G4 — Decommission rationale documented in `baseline.md`.

## 3. Scope — Components & Services
- **Repo:** `packages/diamonds/` only.
- **Edited:** `.husky/pre-push` (remove the slither block, ~lines 44–49); `package.json` (`security-check` script — drop `yarn slither:scan &&`).
- **Kept untouched:** `package.json` `slither:scan`/`slither:check` scripts; `slither.config.json`.
- **Written:** `baseline.md` (decommission rationale).

## 4. Stakeholders & Impact
- **Engineer (agent):** executes. **Owner:** decision made (keep-as-manual). **User-facing/production impact:** none — hook + script config only; no source/runtime change. Reduces a broken/inappropriate gate.

## 5. Operational Requirements
1. Remove the slither block from `.husky/pre-push` — the `echo "🐍 Running Solidity static analysis with Slither..."` line and the `if ! yarn slither:scan > /dev/null 2>&1; then … success=false; fi` block (~lines 44–49). Leave the rest of the hook intact (M4 restructures it).
2. Remove `yarn slither:scan &&` from the `security-check` script in `package.json`, keeping the other checks in order.
3. **Keep** the `slither:scan` + `slither:check` scripts and `slither.config.json` (optional-manual — no change).
4. Document the decommission rationale in `baseline.md`: tooling repo; contracts are fixtures; slither errors in-container (cite M0); scripts kept for manual use.
5. Verify: `grep -rn slither .husky/` → nothing; `security-check` no longer runs slither; the two `slither:*` scripts + config still present.
6. Make **no** source/runtime change.

## 6. Security & Compliance Considerations
- No secrets/credentials/elevated privileges. Removing an *inappropriate + non-functional* gate; audit + semgrep + git-secrets stay enforced. Rationale documented for auditability (not a silent weakening).

## 7. Non-Goals (Out of Scope)
- The broader hook redesign (lean/resilient, tests off the gate) — M4.
- Deleting the `slither:*` scripts / `slither.config.json` — explicitly **kept** (owner choice A).
- Re-adding contract analysis / real-contract security work.

## 8. Risk, Rollback & Recovery
- **Backup/snapshot required:** no — reversible commit.
- **Risk:** a dangling slither reference remains in a blocking path → **Mitigation:** `grep -rn slither .husky/ package.json` — confirm none in a *gate* (the two manual scripts are fine).
- **Risk:** editing the hook block breaks the shell syntax → **Mitigation:** remove the whole `if…fi` block cleanly; the hook still parses (M4 will rewrite it anyway).
- **Rollback:** `git checkout .husky/pre-push packages/diamonds/package.json` restores the slither gate.

## 9. Validation / Success Metrics
- `grep -rn slither .husky/` → empty.
- `security-check` script no longer contains `slither:scan`.
- `slither:scan`/`slither:check` scripts + `slither.config.json` still present (kept as manual).
- Decommission rationale recorded in `baseline.md`.

## 10. Open Questions
- None — the one decision (scripts/config fate) is resolved: **keep as optional-manual**.

**Next:** `/generate-tasks` against this PRD.
