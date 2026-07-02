# Milestone 5 — Regression, Edge Cases & Design Sign-off (M4)

> **Maps to:** [project-plan](../../deployinclude-exclude-fix-project-plan.md) → §5 "M4" · Oracle: [architecture](../../deployinclude-exclude-fix-architecture.md) · Audit: [test-audit-matrix](../../Milestone-00/test-audit-matrix.md)
> **Status:** 📋 planned — *the finish line: confirm + formally close.*
> **Prod / impact:** Tests + docs (no new source behavior). The substantive fix (M1–M3) is done + verified.
> **Author:** Am0rfu5 · **Date:** 2026-06-29
> **Epic breakouts:** [e1-edge-case-configs](../Epic-01/overview/e1-edge-case-configs.md) · [e2-cross-strategy-regression](../Epic-02/overview/e2-cross-strategy-regression.md) · [e3-design-confirmation-signoff](../Epic-03/overview/e3-design-confirmation-signoff.md)

---

## 1. Why this milestone exists
M1–M3 fixed and verified the design (`deployInclude` additive, `deployExclude` correct incl. the upgrade
Remove bug, dead code gone, comprehensive unit + integration tests). M4 **proves the whole thing holds**
(edge cases + cross-strategy regression), builds the **invariant↔test traceability matrix**, and gets the
**Owner sign-off** that closes the project. Critical path: `M0 ✅ → M1 ✅ → M2 ✅ → M3 ✅ → **M4**`.

## 2. Goal & exit criteria
**Goal:** the suite expresses the design; nothing else broke; the project is formally closed. **Exit:**
- [ ] Edge-case configs assert the **oracle** (INV-9 non-existent-selector no-op; `include-and-exclude`
      reframed to **pending/deferred** per ratified INV-7/DR-4), not just "deploys".
- [ ] Regression confirmed: RPC/Local inherit the fix; `DiamondDeployment` + broader suite green; the
      hardhat-diamonds `signer` change is not implicated; OZDefender still compiles.
- [ ] The upgrade integration E2E **deferred from M3-E4** is built (if feasible) or documented as
      unit-covered (M3-E1).
- [ ] **§11 traceability matrix** complete: every invariant (INV-1…9) ↔ ≥1 non-vacuous passing test (or
      "deferred → validator" for INV-7/8).
- [ ] **Owner sign-off** that the suite expresses the approved design (blocking).

## 3. Scope
**In:** edge-case test tightening (E1); regression confirmation + deferred upgrade E2E (E2); traceability
matrix + sign-off (E3). **Out:** new features/behavior; INV-7/8 enforcement (validator); the
`basestrategy-fulfillment` redesign.

## 4. Roles
- **Engineer (agent-assisted):** E1, E2, and drafting E3's matrix. **Owner:** the **M4-E3 sign-off gate** (blocking).

## 5. Epics
| Epic | Title | Owner | Impact | Breakout |
|------|-------|-------|--------|----------|
| M4-E1 | edge-case-configs | Engineer | Med | [e1-edge-case-configs](../Epic-01/overview/e1-edge-case-configs.md) |
| M4-E2 | cross-strategy-regression | Engineer | Med | [e2-cross-strategy-regression](../Epic-02/overview/e2-cross-strategy-regression.md) |
| M4-E3 | design-confirmation-signoff | Owner | High | [e3-design-confirmation-signoff](../Epic-03/overview/e3-design-confirmation-signoff.md) |

### M4-E1 — `edge-case-configs`
Tighten the existing edge-case tests in `DeployIncludeExclude.test.ts`: `invalid-include`/`invalid-exclude`
→ assert INV-9 directly (non-existent selector is a no-op, deploy succeeds); `include-and-exclude` (B17)
→ reframe from "asserts success" to **pending/deferred** (INV-7 is a hard error whose enforcement is the
validator's, DR-4). Root tests, uncommitted.

### M4-E2 — `cross-strategy-regression`
Confirm the fix holds across the board: RPC/Local inherit `BaseDeploymentStrategy`; run `DiamondDeployment`
+ the broader root + submodule suites; rule the hardhat-diamonds `signer` change in/out against the green
baseline; OZDefender still compiles. **Plus** the upgrade integration E2E deferred from M3-E4 — build if a
clean deploy→upgrade is feasible, else record M3-E1's unit probe as the verification of record.

### M4-E3 — `design-confirmation-signoff` (OWNER GATE)
Build the §11 invariant↔test traceability matrix (from the M0-E3 audit + every test written M1–M3); each
invariant maps to ≥1 non-vacuous passing test (or "deferred → validator" for INV-7/8). **OP-2 (blocking):**
Owner reviews + signs off that the suite expresses the approved design → project closed.

## 6. Dependencies & sequencing
- **Upstream:** M1–M3 (the fix + tests). **Internal:** E1 + E2 (confirmation) → E3 (matrix + sign-off).
- **Owner gate:** **OP-2 (M4-E3 sign-off)** — blocking the project's closure.

## 7. Rollback posture
Tests/docs only; revert individual files. No production surface.

## 8. Risks (milestone-scoped)
| Risk | Mitigation |
|------|------------|
| A regression hides in an unrun corner | M4-E2 runs the broader suite + cross-strategy; the green baseline is the reference. |
| Traceability matrix overstates coverage | Each row must cite a real, non-vacuous test (file::name); INV-7/8 honestly marked deferred. |

## 9. Definition of Done for Milestone 5 (M4)
- Edge cases assert the oracle; regression confirmed; upgrade E2E built-or-documented.
- Traceability matrix complete; **Owner sign-off** recorded → **project closed**.

---
**Next:** `/breakout-epics` (this run) → `/create-prd` per epic → `/generate-tasks` → `/process-task-list`. **E3 ends with the Owner gate.**
