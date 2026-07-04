# Epic 2 — Findings Baseline + Rationale (M0-E2)

> **Parent milestone:** [Milestone 1 — Baseline & Reliable Scan Harness (M0)](../../overview/milestone-01-baseline-and-scan-harness.md) · **Maps to:** [`pre-push-security-gates-project-plan.md`](../../../pre-push-security-gates-project-plan.md) §5 M0 → M0-E2
> **Owner:** Engineer · **Impact/blast radius:** read-only reference doc; no source/config/hook change · **Estimated effort:** S · **Status:** 📋 planned

## 1. Objective
Produce **`baseline.md`** — a timestamped snapshot of the current state of every pre-push gate — and author the reusable **tooling-repo rationale** note that M2 (semgrep rule scoping) and M3 (slither removal) both cite. This is the measuring stick: every later milestone proves "green" against these recorded findings, and the rationale is the single documented justification for scoping/removing contract-security gates on a tooling repo.

## 2. Acceptance criteria
- [ ] `baseline.md` records, per gate, the current result (using M0-E1's invocations), with a working-tree note + timestamp:
  - **npm audit** — the 2 lodash moderate advisories (ids, `4.17.21`, "no upstream 4.x patch").
  - **semgrep** — the 10 blocking findings: rule id + file + line for each; note which are Solidity-security rules (likely on test-fixture contracts) vs `typescript-any-usage` vs genuine.
  - **git-secrets** — clean.
  - **slither** — best-effort enumeration or a recorded note that it needs compiled artifacts / errored (framed as evidence for the M3 removal decision).
  - **tests** — current submodule `test`/`test:unit` result (planning baseline: 51/0).
- [ ] The **tooling-repo rationale** paragraph is written in `baseline.md` (or a linked note): *diamonds is a TS library/tool; the in-repo Solidity contracts exist only as test fixtures, so contract-security analyzers (slither, semgrep's Solidity rules) are applied with that lens.* Cited by M2 + M3.
- [ ] No source, config, or hook modified.

## 3. Tasks
| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | Run each gate via the M0-E1 invocations; capture current output | Engineer | fresh output captured, timestamped |
| 2 | Record npm-audit findings (advisory ids, package/version, "no upstream patch") | Engineer | audit section written |
| 3 | Record semgrep findings — enumerate all 10 (rule id, file, line); pre-classify Solidity-on-fixtures vs TS vs genuine | Engineer | semgrep section written with per-finding rows |
| 4 | Record git-secrets (clean) + tests (current count) | Engineer | both recorded |
| 5 | Record slither best-effort (enumeration or "needs artifacts/errored") | Engineer | slither section written, marked best-effort |
| 6 | Author the tooling-repo rationale note in `baseline.md` | Engineer | rationale paragraph present, ready for M2/M3 to cite |

## 4. Dependencies & owner gates
- **Upstream:** M0-E1 (invocations). The rationale note has no code dependency and can be drafted in parallel.
- **Owner gates:** none — read-only.
- **Downstream:** M1 (audit target), M2 (semgrep targets + cites rationale), M3 (slither removal cites rationale + baseline evidence), M4 (knows which gates must run in-container).

## 5. Risks
| Risk | Mitigation |
|------|------------|
| Baseline captured against a stale/dirty tree | Note working-tree state + timestamp; re-run if source changes before M1 starts |
| semgrep enumeration incomplete (only summary captured) | Run semgrep without `--error`/quiet flags to list each finding's rule id + location |
| Pre-classification of findings biases M2 | Mark classifications as *preliminary*; M2-E1 does the authoritative triage |
| Rationale reads as "disable security to pass" | Frame it as scope-appropriateness for a tooling repo (contracts are fixtures), not a blanket security waiver; keep audit + semgrep-on-product-code enforced |

## 6. Notes
- Fully reversible — documentation only.
- Planning-phase scoping already produced most numbers (audit 2× lodash, semgrep 10/6-rules, git-secrets clean, tests 51/0); this epic formalizes + completes them (esp. the full per-finding semgrep enumeration and the slither best-effort run) into `baseline.md`.
- `baseline.md` is a **living reference**: M1–M3 re-run their own gate to confirm 0, rather than trusting a diff against this snapshot.
