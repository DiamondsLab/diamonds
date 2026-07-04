# Changelog — M0-E2 Findings Baseline + Rationale

## 2026-07-03 — Findings recorded + rationale authored (read-only) — with two plan-affecting corrections

- Appended the **Findings** + **Tooling-repo rationale** sections to [`baseline.md`](../../baseline.md), confirmed against the committed `yarn.lock`.
- **⚠️ Correction 1 (affects M1):** npm audit is **26 advisories — 13 high + 13 moderate** (primarily `axios` + `lodash`), **not** the "2 lodash moderate" the plan assumed. That "2" was a **truncation artifact** of planning-phase scoping (`| tail -25`). **M1 must be re-scoped** from "remove unused lodash" to real dependency remediation (axios upgrade + transitive + lodash).
- **⚠️ Correction 2 (refines M2):** all 10 semgrep findings are `typescript-any-usage` in **one product-code file** (`src/cli/diamond-abi-cli.ts`, lines 348–479) — **not** Solidity-security rules on test fixtures. M2 = fix/annotate those `any` usages or tune that rule; the Solidity-on-fixtures rationale does **not** apply to the current semgrep findings (it applies to slither only).
- git-secrets clean; slither errors (crytic-compile `KeyError: 'output'`, evidence for M3); tests 51/0 (leave gate in M4).
- Authored the **tooling-repo rationale** (diamonds is a TS tool; contracts are fixtures) — cited by M3 (and M2 for any Solidity rule); explicitly **not** a blanket waiver (audit + TS-rules-on-src stay enforced).
- Secret-safe: recorded rule ids + `file:line` only; no flagged content transcribed. No source/config/hook changed.
- **Recommendation:** update the project plan's M1 (and M2) scope before breaking them out — surfaced to the owner.
