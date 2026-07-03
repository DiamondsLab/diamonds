# Epic 1 — Enumerate & Classify (M2-E1)

> **Parent milestone:** [Milestone 3 — Semgrep Gate: Triage & Disposition (M2)](../../overview/milestone-03-semgrep-triage-disposition.md) · **Maps to:** [`pre-push-security-gates-project-plan.md`](../../../pre-push-security-gates-project-plan.md) §5 M2 → M2-E1
> **Owner:** Engineer · **Impact/blast radius:** read-only analysis; no code change · **Estimated effort:** S · **Status:** 📋 planned

## 1. Objective
Read the 10 `typescript-any-usage` sites in `src/cli/diamond-abi-cli.ts` and classify each: is a **real, specific type** cheaply available (→ *fix*), or is the `any` **genuinely justified** (dynamic CLI arg / JSON / third-party shape where a precise type adds little → *annotate* or *tune*)? Then frame the **disposition posture** (fix-all / annotate-all / tune-the-rule / mix) for owner decision. This produces the per-finding plan M2-E2 executes.

## 2. Acceptance criteria
- [ ] A per-finding table: `line | context (what the `any` is) | fixable with a real type? | proposed disposition`.
- [ ] All **10** flagged lines covered (348, 350, 355, 359, 375, 394, 474, 477, 478, 479).
- [ ] A **recommended posture** (fix / annotate / tune / mix) with a one-line rationale, ready for owner sign-off at `/create-prd`.
- [ ] No code changed (read-only).

## 3. Tasks
| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | Read `src/cli/diamond-abi-cli.ts` around each flagged line; capture what each `any` represents | Engineer | context noted per line |
| 2 | Classify each: fixable-with-a-real-type vs justified-any | Engineer | column filled |
| 3 | Propose a per-finding disposition (fix / `nosemgrep` / rule-tune) + a recommended overall posture | Engineer | table + recommendation |
| 4 | Record the table + recommendation in `baseline.md` (M2 section) | Engineer | recorded |

## 4. Dependencies & owner gates
- **Upstream:** M0 (baseline enumeration + reliable `semgrep` invocation) — done.
- **Owner gates:** none blocking. One **decision** to surface at `/create-prd`: the disposition posture (fix vs annotate vs tune). Not a credential/provisioning gate.
- **Downstream:** M2-E2 applies the chosen disposition.

## 5. Risks
| Risk | Mitigation |
|------|------------|
| Mis-classifying a fixable `any` as "justified" (suppressing instead of fixing) | Err toward a real type where it's cheap; only mark justified where the value is genuinely dynamic |
| Recommendation biases the owner | Present fixable-vs-justified counts objectively; let the owner pick the posture |

## 6. Notes
- Read-only — analysis + a `baseline.md` update.
- `diamond-abi-cli.ts` is a CLI entrypoint (`bin`) — `any` there is often CLI-arg/JSON parsing, which colors the fix-vs-justified call.
- Feeds the M2-E2 disposition; keep classifications concrete (per line), not a blanket verdict.
