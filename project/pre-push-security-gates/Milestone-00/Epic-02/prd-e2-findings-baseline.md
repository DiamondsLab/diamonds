# Change Plan (PRD) — M0-E2 Findings Baseline + Rationale

> **Expands:** [`overview/e2-findings-baseline.md`](overview/e2-findings-baseline.md) · **Parent:** [Milestone 1 (M0)](../overview/milestone-01-baseline-and-scan-harness.md) · **Plan:** [`pre-push-security-gates-project-plan.md`](../../pre-push-security-gates-project-plan.md)
> **Type:** read-only documentation · **Status:** 📋 ready for `/generate-tasks` · **Date:** 2026-07-03 · **Depends on:** M0-E1 (invocations, done)

## 1. Overview & Problem
M0-E1 established *how* to run each gate in-container; M0-E2 records *what each currently reports* and *why contract-security gates are scoped/removed on this repo*. Without a recorded findings snapshot, M1–M3 can't prove they cleared a gate, and the slither-removal (M3) / semgrep-scoping (M2) decisions would lack a single documented justification. **Goal:** append to `baseline.md` (a) the current per-gate findings and (b) the reusable tooling-repo rationale note — read-only, no code touched.

## 2. Goals
- G1 — Record **npm audit** findings: advisory ids `1115810` + `1120370` (both lodash, moderate, prototype pollution), package `lodash@4.17.21`, "no upstream 4.x patch."
- G2 — Record **all 10 semgrep findings** by `rule id → file → line`, pre-classified as *(a)* Solidity-security rule on a test-fixture contract, *(b)* `typescript-any-usage`/TS, or *(c)* genuine.
- G3 — Record **git-secrets** (clean) and **tests** (current submodule count, ~51/0).
- G4 — Record **slither** best-effort (errors: crytic-compile `KeyError: 'output'`) as evidence for M3.
- G5 — Author the **tooling-repo rationale** paragraph in `baseline.md`, cited by M2 + M3.

## 3. Scope — Components & Services
- **Repo:** `packages/diamonds/` (the `@diamondslab/diamonds` submodule) only.
- **Tools invoked (read-only):** the M0-E1 invocations — `yarn npm audit --severity moderate`, `semgrep scan --config .semgrep.yml --exclude-rule weak-encryption`, `git secrets --scan`, `slither … --ignore-compile`.
- **File written:** `packages/diamonds/project/pre-push-security-gates/baseline.md` — the *Findings* + *Tooling-repo rationale* sections (the invocations section already exists from M0-E1).
- **Read for classification:** the semgrep-flagged files (e.g. `src/cli/diamond-abi-cli.ts`) and `.semgrep.yml` rules, to label each finding.

## 4. Stakeholders & Impact
- **Engineer (agent):** executes; the only actor.
- **Owner:** none — no approval needed; nothing outward-facing.
- **User-facing / production impact:** none. Documentation-only; changes no code, config, or hook. Downstream: M1 (audit target), M2 (semgrep targets + cites rationale), M3 (slither removal cites rationale + evidence), M4 (gate set).

## 5. Operational Requirements
1. Using M0-E1's invocations, capture fresh output for each gate (timestamped).
2. Write an **npm audit** findings subsection: both advisory ids, the URL/title, `lodash@4.17.21`, and the "no upstream 4.x patch" note (mitigation deferred to M1).
3. Write a **semgrep** findings subsection: a table of all 10 findings (`# | rule id | file | line | preliminary class (a/b/c)`); classes marked **preliminary** (authoritative triage is M2-E1).
4. Write **git-secrets** (clean) and **tests** (current count, invocation) subsections.
5. Write a **slither** subsection: the best-effort result (errors / does-not-run) as evidence for the M3 decommission.
6. Author the **tooling-repo rationale** paragraph: diamonds is a TS library/tool; in-repo Solidity contracts exist only as test fixtures; contract-security analyzers (slither, semgrep's Solidity rules) are applied with that lens — **not** a blanket security waiver (audit + semgrep-on-product-code stay enforced).
7. Make **no** change to any source file, config, or hook.

## 6. Security & Compliance Considerations
- No secrets/credentials/elevated privileges — read-only scans + a doc write.
- When transcribing findings, **never** copy any secret-looking value verbatim into `baseline.md` — record rule id + file + line, not the flagged content (e.g. for `insecure-private-key`/`hard-coded-secret` rules, reference the location, not the string).
- No production or sensitive resource touched; no human-approval gate applies.

## 7. Non-Goals (Out of Scope)
- **Fixing / suppressing** any finding, or changing any dep/rule/config/hook (M1–M4).
- **Authoritative** triage of semgrep findings (real vs false-positive) — M0-E2 only *pre-classifies*; M2-E1 decides.
- Hardening slither/tests to run (best-effort only).
- CI (out of scope for the whole project).

## 8. Risk, Rollback & Recovery
- **Backup/snapshot required:** no — read-only; only appends to `baseline.md`.
- **Risk:** stale capture → **Mitigation:** timestamp + working-tree note; re-run gate if source changes before M1.
- **Risk:** copying a flagged secret value into the doc → **Mitigation:** record location only, never the content (see §6).
- **Risk:** preliminary classification biases M2 → **Mitigation:** label classes *preliminary*; M2-E1 is authoritative.
- **Rollback:** revert the `baseline.md` findings/rationale sections (documentation only).

## 9. Validation / Success Metrics
- `baseline.md` contains Findings subsections for all five gates + the rationale paragraph, timestamped.
- The semgrep table lists **10** rows (matches "10 findings"); the audit subsection names both advisory ids.
- No secret value is transcribed (locations only).
- `git status` shows no source/config/hook change — only the updated `baseline.md` (+ this epic's docs).

## 10. Open Questions
- Depth of semgrep pre-classification — a one-word class per finding is enough; full per-finding reasoning is M2's job. **Default:** one-word class + a short note only where non-obvious.

**Next:** `/generate-tasks` against this PRD.
