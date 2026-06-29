# Epic 3 — Design Confirmation & Sign-off (M4-E3) — OWNER GATE

> **Parent milestone:** [Milestone 5 (M4)](../../overview/milestone-05-regression-and-signoff.md) · **Maps to:** [project-plan](../../../deployinclude-exclude-fix-project-plan.md) §5 M4 row M4-E3 + §11 traceability
> **Owner:** Owner (Am0rfu5) · **Impact:** Project closure. · **Effort:** S · **Status:** 📋 planned

## 1. Objective
Build the **invariant↔test traceability matrix** (every INV-1…9 ↔ a real, non-vacuous passing test, or
"deferred → validator" for INV-7/8), confirm the suite expresses the approved design, and obtain the
**Owner sign-off** that closes the project.

## 2. Acceptance criteria
- [ ] A traceability matrix (`Milestone-04/traceability-matrix.md`) with one row per invariant →
      `unit test (file::name)` + `integration test (file::name)`, or **deferred → validator** (INV-7/8).
- [ ] Every mapped test is **real and non-vacuous** (cite the actual test).
- [ ] The §11 table in the project plan is filled from it.
- [ ] **OP-2 (blocking owner gate):** Owner signs off that the suite expresses the design → **project closed**.

## 3. Tasks
| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | Assemble the matrix from the M0-E3 audit + every test written M1–M3 (unit `selectorResolution*.test.ts`, integration `DeployAdditive`/`DeployIncludeExclude`) | Engineer | every invariant has a citation or "deferred" |
| 2 | Fill the project plan §11 table | Engineer | §11 complete |
| 3 | **OP-2:** Owner reviews + signs off | Owner | sign-off recorded; project closed |

## 4. Dependencies & owner gates
- **Upstream:** M4-E1 + M4-E2 (the confirmed suite). **OP-2 (blocking):** Owner sign-off — the project's closure gate.

## 5. Risks
| Risk | Mitigation |
|------|------------|
| Matrix cites a vacuous/missing test | Each row cites a real test by name; spot-check 3 rows; INV-7/8 honestly "deferred → validator". |

## 6. Notes
- Owner-only sign-off (OP-2) — the agent drafts the matrix; the Owner alone clears the gate.
