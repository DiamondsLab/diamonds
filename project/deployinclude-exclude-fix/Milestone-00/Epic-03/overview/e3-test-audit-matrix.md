# Epic 3 — Test-Audit Matrix (M0-E3)

> **Parent milestone:** [Milestone 1 — Oracle & Baseline (M0)](../../overview/milestone-01-oracle-and-red-baseline.md)
> **Maps to:** [project plan](../../../deployinclude-exclude-fix-project-plan.md) → §5 M0 epic table, row M0-E3 · Oracle: [deployinclude-exclude-fix-architecture.md](../../../deployinclude-exclude-fix-architecture.md)
> **Owner:** Engineer (agent-assisted) · **Impact / blast radius:** High — defines exactly which assertions M2/M3 must correct and which tests M1 must add. · **Estimated effort:** S–M (static analysis of two test files) · **Status:** 📋 planned

## 1. Objective

Inventory **every** assertion in the two existing suites and classify each against the frozen oracle as
**keep**, **correct** (rewrite), or **add**, binding every one to an invariant (INV-1…9). The "correct"
bucket now explicitly includes **vacuous passes** — assertions that pass only because a guard is false at
HEAD and therefore assert *nothing* (e.g. `DeployIncludeExclude.test.ts:142-164`, whose
`if (registry.has('0xdc38f9ab'))` guard is false). This is what prevents the project from "passing" tests
that prove nothing — and it names the coverage the current fixtures *cannot* provide, handing M1-E3 its
mandate (the additivity discriminator) and M2/M3 their exact correction list.

## 2. Acceptance criteria

- [ ] A matrix `Milestone-00/test-audit-matrix.md` with one row per `it()` across
      `test/deployment/DeployIncludeExclude.test.ts` and `test/deployment/SelectorRegistration.test.ts`,
      columns: `suite · it() · current assertion · classification (keep/correct/add) · target oracle · invariant`.
- [ ] Every **correct** row names the precise change — explicitly including
      `DeployIncludeExclude.test.ts:142-164` (a **vacuous pass**: its `if (registry.has('0xdc38f9ab'))`
      guard is false at HEAD so it asserts nothing → rewrite to assert INV-6 absence directly).
- [ ] Every row binds to an invariant; any assertion that **cannot** be bound is logged as a finding
      (it may be testing the wrong thing).
- [ ] Coverage gaps named explicitly — at minimum **INV-3 additivity** (Fixtures A & B both net to 1
      selector/facet whether additive or whitelist → untestable without Fixture C), **INV-6 absence**,
      and the **upgrade/redeploy path** (no current test deploys-then-upgrades with an include/exclude
      change); note whether **INV-8** (dual-include) has any home in the current suite.
- [ ] An **"add" list** enumerating new tests needed (the input to M1-E2/M1-E3 and the M4 edge-case work).

## 3. Tasks

| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | Enumerate every `describe`/`it` in both suites; transcribe each assertion | Engineer | Full inventory exists (no `it()` omitted) |
| 2 | Classify each as keep / correct / add against the frozen oracle | Engineer | Every row has a classification |
| 3 | Bind each row to an invariant; log unbindable assertions as findings | Engineer | Every row mapped or flagged |
| 4 | Flag the vacuous/bug-encoding assertions explicitly (start with the L142-164 vacuous pass) | Engineer | Correction targets listed with file:line |
| 5 | Name coverage gaps (INV-3, INV-6, **upgrade-path**, INV-8) and produce the "add" list | Engineer | Gaps + new-test list written |
| 6 | Write/commit `Milestone-00/test-audit-matrix.md` | Engineer | Artifact committed; handed to M0-E1, M1, M2/M3 |

## 4. Dependencies & owner gates

- **Upstream:** ideally read alongside M0-E2's baseline (so "current assertion" reflects *observed*
  pass/fail), but can proceed from source alone. Classification is provisional until the oracle is
  frozen by **OP-1 (M0-E1)** — re-confirm the matrix after freeze if any invariant was amended.
- **No owner gate of its own.** Engineer-executable.
- **Downstream:** M1-E2 (which tests to write), M1-E3 (Fixture C mandate), M2-E2 & M3 (which assertions
  to correct), M4-E3 (seeds the traceability matrix).

## 5. Risks

| Risk | Mitigation |
|------|------------|
| A subtly vacuous/bug-encoding assertion slips through as "keep" | Require every row to bind to an invariant; an assertion that "passes today" but asserts nothing (guard-gated/empty) or can't be justified by the oracle is a **correct**, not a keep. |
| Classification drifts if the oracle changes at OP-1 | Mark the matrix "provisional pending OP-1"; reconcile after freeze. |
| Gaps under-reported, so additive semantics ships untested | INV-3 must appear as an explicit, named gap with Fixture C as its remedy. |

## 6. Notes

- **Reversible:** docs/analysis only — no source or test edits in this epic (corrections are *planned*
  here, *applied* in M2/M3).
- Anchor for the "correct" bucket: the exclude describe-block at
  `test/deployment/DeployIncludeExclude.test.ts:142-164` is a **vacuous pass** — its
  `if (registry.has('0xdc38f9ab'))` guard is **false** at HEAD (the excluded selector is correctly
  absent), so the inner assertion never runs and the test proves nothing. Under INV-6 it must be rewritten
  to assert the selector is **absent** *directly* (e.g. `facetAddress('0xdc38f9ab') === ZeroAddress`).
- The matrix is the single source for M4-E3's invariant↔test traceability table — author its columns so
  they slot straight in.
