# Tasks — M2-E2 Test Correction

Execution checklist for [prd-e2-test-correction.md](prd-e2-test-correction.md). Rewrite the vacuous B4
assertion to assert INV-6 absence directly. Root test edit; left uncommitted per convention.

## Relevant Files & Resources
- **Edit (root):** `test/deployment/DeployIncludeExclude.test.ts` (B4, lines ~142-164).
- **Review (root):** `test/deployment/SelectorRegistration.test.ts`.
- **Append:** `…/Milestone-02/Epic-02/CHANGELOG.md`.

### Notes
- Integration now runs the workspace diamonds (M2-E1 wiring) — so `facetAddress(0xdc38f9ab) == 0` is the
  real, verifiable INV-6 fact under the exclude config. Root test → leave uncommitted.

## Tasks
- [x] 0.0 Prepare — baseline 191/69/0; B4 vacuous.
- [x] 1.0 Rewrite B4
  - [x] 1.1 Replaced the guard + bug-encoding assertion with unconditional `facetAddress('0xdc38f9ab') == ZeroAddress` (INV-6 absence).
  - [x] 1.2 Scanned both suites — `SelectorRegistration` needs no change (pure calc/parse, already non-vacuous).
- [x] 2.0 Verify
  - [x] 2.1 `DeployIncludeExclude` → 17/17 (B4 non-vacuous, passing).
  - [x] 2.2 Full root `yarn test` → **191/69/0**.
- [x] 3.0 Record — CHANGELOG written; root test left uncommitted; memory updated.

> ✅ **M2-E2 COMPLETE — and M2 (Additivity & Test Correctness) COMPLETE.** Both additivity REDs green; B4 non-vacuous; suite 191/69/0.
