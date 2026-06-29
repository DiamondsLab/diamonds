# Changelog — M0-E3 Test-Audit Matrix

## 2026-06-28 — Audit complete

- Classified all **23 `it()`** across `SelectorRegistration.test.ts` (6) and
  `DeployIncludeExclude.test.ts` (17) against the **frozen** oracle.
- Result: **19 keep · 2 correct · gaps named.** Artifact: [`Milestone-00/test-audit-matrix.md`](../test-audit-matrix.md).
- **Correct (rewrite):**
  - **B4** (`DeployIncludeExclude.test.ts:142-164`) — vacuous (guard false) → rewrite to assert **INV-6
    absence** directly (`facetAddress('0xdc38f9ab') == ZeroAddress`).
  - **B17** (`:569-591`) — asserts the `include-and-exclude` config **succeeds**, which **contradicts
    ratified INV-7 (hard error)**; reframe to **pending/deferred** (enforcement is the validator's, DR-3/DR-4).
- **Coverage gaps (the "add" list):** **INV-3 additivity** (needs Fixture C) and the **upgrade/redeploy
  path** (needs a deploy→upgrade test) — the two headline reframe items. INV-9 covered but weakly;
  INV-7/INV-8 enforcement deferred to the validator.
- Matrix columns authored to slot directly into the §11 traceability table (M4-E3). **M0-E3 complete →
  M0 (oracle + baseline + audit) fully closed.**
